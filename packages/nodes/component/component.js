import { load } from '../../utils'

class Component {
  constructor(component, app, keyNode, nodeElement) {
    this.app = app
    this.name = keyNode
    this.nodeElement = nodeElement
    this.component = component
    if (!this.component.src) return this.app.errorComponent(nodeElement.nodepath, 203)
  }
  async props(proxies, val, index) {
    const result = {}
    if (proxies) result.proxies = proxies
    result.params = this.params(this.component.params, val, index)
    result.methods = this.methods(this.component.methods)
    result.section = this.component.section
    result.name = this.name
    return result
  }
  methods(methods) {
    const result = {}
    if (methods) {
      for (const [pr, v] of Object.entries(methods)) {
        if (typeof v === 'function') {
          Object.assign(result, { [pr]: v })
        }
      }
    } return result
  }
  params(params, val, index) {
    const result = {}
    if (params) {
      for (const [pr, fn] of Object.entries(params)) {
        let data = null
        if (typeof fn === 'function' && fn.name) {
          data = val ? fn(val, index) : fn(this.nodeElement)
        } else data = fn
        Object.assign(result, { [pr]: data })
      }
    } return result
  }
  async create(src, proxies, val, index) {
    if (src) {
      const props = await this.props(proxies, val, index)
      const options = await load(src)
      return await this.app.mount(options, props, this.nodeElement)
    }
  }
}
export { Component }
