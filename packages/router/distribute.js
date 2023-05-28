function distribute(routes, list, errorRouter, parentPath = '', parentParams = {}, parentExtras = {}) {
  routes.forEach(route => {
    if (!route.hasOwnProperty('path')) return errorRouter(route.name, 557)
    const path = parentPath + route.path.replace(/\/$/, '')
    const params = { ...parentParams, ...route.params }
    route.params = params
    const extras = { ...parentExtras, ...route.extra }
    route.extras = extras
    list.push({ name: route.name, path, route })
    if (route.children) {
      distribute(route.children, list, errorRouter, path, params, extras)
    }
  })
}

export default distribute