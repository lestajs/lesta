import { active, dive, replicate } from '../utils'
import { errorStore } from '../utils/catcher'

class Store {
  constructor(options, app, name) {
    this.store = options
    this.context = {
      name,
      reactivity: new Map(),
      param: {},
      method: {},
      router: app.router || {},
      source: this.store.sources
    }
    Object.assign(this.context, app.common)
    this.context.param = this.store.params
    Object.preventExtensions(this.context.param)
    for (const key in this.store.methods) {
      this.context.method[key] = (...args) => {
        if (args.length && (args.length > 1 || typeof args[0] !== 'object')) return errorStore(this.context.name, 404, key)
        const arg = {...replicate(args[0])}
        if (this.store.middlewares && key in this.store.middlewares) {
          return (async () => {
            const res = await this.store.middlewares[key].bind(this.context)(arg)
            if (res && typeof res !== 'object') return errorStore(this.context.name, 404, key)
            if (arg && res) Object.assign(arg, res)
            return this.store.methods[key].bind(this.context)(arg)
          })()
        } else {
          return this.store.methods[key].bind(this.context)(arg)
        }
      }
    }
    this.context.proxy = dive(this.store.proxies, {
      beforeSet: (value, ref, compare, intercept) => {
        if (!this.store.setters || !this.store.setters[ref]) {
          compare()
        } else {
          const v = this.store.setters[ref].bind(this.context)(value)
          intercept(v)
        }
      },
      set: async (target, path, value, ref) => {
        active(this.context.reactivity, ref, value, path)
      }
    })
    Object.preventExtensions(this.context.proxy)
  }
  created() {
    this.store.created && this.store.created.bind(this.context)()
  }
  params(key) {
    return this.context.param[key]
  }
  proxies(key, container) {
    const active = (v, p) => container.proxy[key](v, p)
    this.context.reactivity.set(active, key)
    container.unstore[key] = () => this.context.reactivity.delete(active)
    return this.context.proxy[key]
  }
  methods(key) {
    return this.context.method[key]
  }
}
export { Store }