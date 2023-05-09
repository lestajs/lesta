const _evalHTML = {
  update: (node, options) => {
    const value = typeof options === 'function' ? options(node) : options
    node.innerHTML = value
  }
}

export { _evalHTML }