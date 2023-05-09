import Directives from './node/directives/index.js'
import Native from './node/native/index.js'

export default class NodesBasic {
  constructor(node, context, nodeElement, impress, app, keyNode) {
    this.app = app
    this.node = node
    this.context = context
    this.impress = impress
    this.nodeElement = nodeElement
    this.keyNode = keyNode
    this.directive = new Directives(node, context, nodeElement, impress, app, keyNode)
    this.native = new Native(node, context, nodeElement, impress, app, keyNode)
  }
  async controller(key) {
    if (key in this.nodeElement) {
      this.native.init(key)
    } else if (key in this.context.directives) {
      this.directive.init(key)
    } else if (key === 'component' && this.component) {
      await this.component()
    } else {
      this.app.errorNode(this.nodeElement.nodepath, 104, key)
    }
  }
}