import { lifecycle } from '../../lifecycle'
import { InitBasic } from '../../init/basic'
import { errorNode } from '../../utils/catcher'
import NodesBasic from '../../nodes/basic'

async function createWidget(options, root) {
  const component = new InitBasic(options, { errorNode }, NodesBasic)
  root.innerHTML = options.template
  await lifecycle(component, root)
  return {
    destroy() {
      if (root.reactivity) root.reactivity.node.clear()
      root.method = {}
      root.innerHTML = ''
    }
  }
}

export { createWidget }