import { InitBasic } from './basic'
import {replicate, deliver } from '../utils'

class Init extends InitBasic {
  constructor(...args) {
    super(...args)
  }
  async destroy(container) {
    if (container.reactivity) container.reactivity.component.clear()
    container.proxy = {}
    container.method = {}
    for (const key in container.unstore) {
      container.unstore[key]()
    }
    delete container.unmount
  }
  async unmount() {
    if (this.context.node) {
      for await (const node of Object.values(this.context.node)) {
        if (node.unmount && !node.hasAttribute('iterable')) {
          if (node.section) {
            for await (const section of Object.values(node.section)) {
              await section.unmount && section.unmount()
            }
          }
          await node.unmount()
        }
        if (node.directives) {
          for await (const directive of Object.values(node.directives)) {
            directive.destroy && directive.destroy()
          }
        }
        if (node.reactivity) node.reactivity.node.clear()
      }
    }
    this.component.unmount && await this.component.unmount.bind(this.context)()
  }

  async props(props, container) {
    if (props.proxies && Object.keys(props.proxies).length && !this.component.props?.proxies) return this.app.errorComponent(container.nodepath, 211)
    if (!container.proxy) container.proxy = {}
    if (this.component.props) {
      if (this.component.props.proxies) {
        for (const key in props.proxies) {
          if (!(key in this.component.props.proxies)) return this.app.errorProps(container.nodepath, 'proxies', key, 301)
        }
        for (const key in this.component.props.proxies) {
          const prop = this.component.props.proxies[key]
          if (typeof prop !== 'object') return this.app.errorProps(container.nodepath, 'proxies', key, 302)
          const validation = (v) => {
            if (prop.required && (v === null || v === undefined)) this.app.errorProps(container.nodepath, 'proxies', key, 303)
            const value = v ?? prop.default ?? null
            if (prop.type && typeof value !== prop.type) this.app.errorProps(container.nodepath, 'proxies', key, 304, prop.type)
            return value
          }
          container.proxy[key] = (value, path) => {
            if (path && path.length !== 0) {
              deliver(this.context.proxy[key], path, value)
            } else {
              this.context.proxy[key] = validation(value)
            }
          }
          let v = null
          const { store } = prop
          if (props.proxies && key in props.proxies) {
            v = props.proxies[key]
          } else if (store) {
            await this.app.checkStore(store)
            if (!container.destorey) container.unstore = {}
            container.unstore[key] = () => {}
            v = this.app.store[store].proxies(key, container)
          }
          this.proxiesData[key] = replicate(validation(v))
        }
      }
      for (const key in this.component.props.methods) {
        const prop = this.component.props.methods[key]
        if (typeof prop !== 'object') return this.app.errorProps(container.nodepath, 'methods', key, 302)
        const { store } = prop
        if (store) {
          await this.app.checkStore(store)
          const method = this.app.store[store].methods(key)
          if (!method) return this.app.errorProps(container.nodepath, 'methods', key, 305, store)
          this.context.method[key] = (...args) => method(...replicate(args))
        } else {
          const isMethodValid = props.methods && (key in props.methods)
          if (prop.required && !(isMethodValid)) return this.app.errorProps(container.nodepath, 'methods', key, 303)
          if (isMethodValid) this.context.method[key] = (...args) => props.methods[key](...replicate(args))
        }
      }
      for (const key in this.component.props.params) {
        const prop = this.component.props.params[key]
        if (typeof prop !== 'object') return this.app.errorProps(container.path, 'params', key, 302)
        const { store } = prop
        const data = props?.params[key]
        if (store) {
          await this.app.checkStore(store)
          const storeParams = this.app.store[store].params(key)
          this.context.param[key] = replicate(storeParams) ?? ((prop.required && this.app.errorProps(container.path, 'params', key, 303)) || prop.default)
        } else {
          const isDataValid =
            data instanceof Promise ||
            data instanceof HTMLCollection ||
            data instanceof NodeList ||
            data instanceof Element ||
            key.startsWith('__')
          this.context.param[key] = isDataValid ? data : replicate(data) ?? ((prop.required && this.app.errorProps(container.path, 'params', key, 303)) || prop.default)
        }
        if (prop.type && typeof this.context.param[key] !== prop.type) this.app.errorProps(container.path, 'params', key, 304, prop.type)
        if (prop.readonly) Object.defineProperty(this.context.param, key, { writable: false })
      }
    }
  }
}
export { Init }