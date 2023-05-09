import { replicate, dive, active } from '../utils'
import { _html, _evalHTML, _class } from './directives'

class InitBasic {
  constructor(component, app, Nodes) {
    this.Nodes = Nodes
    this.component = component
    this.app = app
    this.proxiesData = {}
    this.impress = {
      refs: [],
      collect: false,
      exclude(p) {
        this.collect =  false
        const v = p()
        this.collect =  true
        return v
      },
      define(pr) {
        if(pr && pr[0] === '_') {
          return this.refs[0]
        }
        return [...this.refs]
      },
      clear() {
        this.collect = false
        this.refs.length = 0
      }
    }
    this.context = {
      exclude: this.impress.exclude.bind(this.impress),
      container: null,
      options: component,
      node: {},
      param: {},
      method: {},
      proxy: {},
      source: component.sources,
      directives: { _html, _evalHTML, _class },
      router: app.router || {},
      component: app.components || {},
      root: app.root
    }
    Object.preventExtensions(this.context.source)
    Object.assign(this.context, app.common || {})
    Object.assign(this.context.directives, component.directives || {}, app.directives || {})
  }
  async loaded(container) {
    this.context.container = container
    this.component.loaded && await this.component.loaded.bind(this.context)()
  }
  async created() {
    this.component.created && await this.component.created.bind(this.context)()
  }
  async mounted() {
    this.component.mounted && await this.component.mounted.bind(this.context)()
  }
  methods(container) {
    if (!container.method) container.method = {}
    if (this.component.methods) {
      for (const [key, method] of Object.entries(this.component.methods)) {
        this.context.method[key] = method.bind(this.context)
        container.method[key] = (...args) => this.context.method[key](...replicate(args))
      }
    }
    Object.preventExtensions(this.context.method)
  }
  params() {
    if (this.component.params) {
      for (const key in this.component.params) {
        if (key in this.context.param) return this.app.errorComponent(container.nodepath, 213, key)
        this.context.param[key] = this.component.params[key]
      }
    }
    Object.preventExtensions(this.context.param)
  }
  proxies() {
    if (this.component.proxies) {
      for (const key in this.component.proxies) {
        if (key in this.proxiesData) return this.app.errorComponent(container.nodepath, 214, key)
        this.proxiesData[key] = this.component.proxies[key]
      }
    }
    this.context.proxy = dive(this.proxiesData, {
      beforeSet: (value, ref, compare, intercept) => {
        if (!this.component.setters || !this.component.setters[ref]) {
          compare()
        } else {
          const v = this.component.setters[ref].bind(this.context)(value)
          intercept(v)
        }
      },
      set: (target, path, value, ref) => {
        for (const keyNode in this.context.node) {
          const nodeElement = this.context.node[keyNode]
          nodeElement.reactivity.node && active(nodeElement.reactivity.node, ref)
          nodeElement.reactivity.component && active(nodeElement.reactivity.component, ref, value, path)
          for (const section in nodeElement.section) {
            nodeElement.section[section]?.reactivity.component && active(nodeElement.section[section].reactivity.component, ref, value, path)
          }
        }
        this.component.handlers && this.component.handlers[ref]?.bind(this.context)(value)
      },
      get: (target, ref) => {
        if (this.impress.collect && !this.impress.refs.includes(ref)) {
          this.impress.refs.push(ref)
        }
      }
    })
    Object.preventExtensions(this.context.proxy)
  }
  async nodes(container) {
    if (this.component.nodes) {
      const nodes = this.component.nodes.bind(this.context)()
      for await (const [keyNode, options] of Object.entries(nodes)) {
        const selector = (this.component.selectors && this.component.selectors[keyNode] ) || `.${keyNode}`
        const nodeElement = container.querySelector(selector) || container.classList.contains(keyNode) && container
        if (!nodeElement) return this.app.errorNode(keyNode, 105)
        nodeElement.nodepath = container.nodepath ? container.nodepath + '.' + keyNode : keyNode
        nodeElement.nodename = keyNode
        Object.assign(this.context.node, { [keyNode]: nodeElement })
        if (options) {
          const node = new this.Nodes(options, this.context, nodeElement, this.impress, this.app, keyNode)
          for await (const [key] of Object.entries(options)) {
            await node.controller(key)
          }
        }
      }
      Object.preventExtensions(this.context.node)
    }
  }
}
export { InitBasic }