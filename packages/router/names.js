export default function names(routes, names) {
  routes.forEach(route => {
    if (route.children) {
      const path = route.path
      route.children.forEach(child => {
        if (child.name) {
          names[child.name] = { route: child, path: path + child.path }
        }
      })
    } else if (route.name) {
      names[route.name] = { path: route.path, params: route.params }
    }
  })
}