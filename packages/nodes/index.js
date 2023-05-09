import Iterate from './component/iterate'
import Basic from './component/basic'
import NodesBasic from './basic'

export default class Nodes extends NodesBasic {
  constructor(...args) {
    super(...args)
    const { node, context, nodeElement, impress, app, keyNode } = this
    this.basic = new Basic(node, context, nodeElement, impress, app, keyNode)
    this.iterate = new Iterate(node, context, nodeElement, impress, app, keyNode)
  }
  async component() {
    if (this.nodeElement.hasAttribute('section')) {
      return this.app.errorComponent(this.nodeElement.nodepath, 207)
    }
    if (this.nodeElement.hasAttribute('iterable')) {
      return this.app.errorComponent(this.nodeElement.nodepath, 208)
    }
    if (this.node.component.iterate) {
      await this.iterate.init()
    } else {
      await this.basic.init()
    }
  }
}