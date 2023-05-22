function distribute(routes, list, errorRouter, parentPath = '', parentParams = {}) {
  routes.forEach(route => {
    if (!route.hasOwnProperty('path')) return errorRouter(route.name, 557)
    const path = parentPath + route.path.replace(/\/$/, '')
    const params = { ...parentParams, ...route.params }
    route.params = params
    list.push({ name: route.name, path, route })
    if (route.children) {
      distribute(route.children, list, errorRouter, path, params)
    }
  })
}

export default distribute