async function lifecycle(component, container, props) {
  await component.loaded(container)
  props && await component.props(props, container)
  component.params()
  component.methods(container)
  component.proxies()
  await component.created()
  await component.nodes(container)
  await component.mounted()
}

export { lifecycle }