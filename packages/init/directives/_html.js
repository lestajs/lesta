import { cleanHTML } from '../../utils'

const _html = {
  update: (node, options) => {
    const value = typeof options === 'function' ? options(node) : options
    node.innerHTML = ''
    node.append(...cleanHTML(value))
  }
}

export { _html }
