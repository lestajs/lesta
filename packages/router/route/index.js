export default class Route {
  constructor() {
    this.url = decodeURI(window.location.pathname).toString().replace(/\/$/, '')
    this.result = {
      path: null,
      map: null,
      target: null,
      to: null
    }
  }
  picker(target) {
    if (target) {
      const params = {}
      const slugs = this.result.path.match(/:\w+/g)
      slugs && slugs.forEach((slug, index) => {
        params[slug.substring(1)] = this.result.map[index + 1]
      })
      return {
        path: this.result.map.at(0) || '/',
        params,
        fullPath: window.location.href,
        hash: window.location.hash.slice(1),
        search: Object.fromEntries(new URLSearchParams(window.location.search)),
        rout: {name: target.name, path: this.result.path, params: target.params, extra: target.extra}
      }
    }
  }
  mapping(path) {
    return this.url.match(new RegExp('^' + path.replace(/:\w+/g, '(\\w+)') + '$'))
  }
  find(target) {
    this.result.map = this.mapping(this.result.path)
    let index = 1
    for (const key in target.params) {
      let fl = false
      let param = target.params[key]
      if (!this.result.map && param.optional) {
        const p = this.result.path.replace('/:' + key, '').replace(/\/$/, '')
        this.result.map = this.mapping(p)
        fl = true
      }
      if (this.result.map && param.regex) {
        const value = this.result.map[index]
        if (!param.regex.test(value)) {
          if (!fl) this.result.map = null
        }
      }
      if (!fl) index++
    }
  }
  setpath(path, parent) {
    if (parent) {
      this.result.path = (parent + path).replace(/\/$/, '')
    } else {
      this.result.path = path
    }
  }
  finder(target, parent) {
    this.setpath(target.path, parent)
    this.find(target)
    if (!this.result.map && target.alias) {
      if (Array.isArray(target.alias)) {
        for (const path of target.alias) {
          this.setpath(path, parent)
          this.find(target)
        }
      } else {
        this.setpath(target.alias, parent)
        this.find(target)
      }
    }
  }
  set(target) {
    if (this.result.map) {
      this.result.to = this.picker(target)
      this.result.target = target
    }
  }
  routeEach(routes, errorRouter) {
    let buf = {}
    for (const route of routes) {
      if (!route.path) errorRouter(501, route.name)
      if (route.children) {
        let bufChild = null
        for (const child of route.children) {
          if (!child.path) errorRouter(501, child.name)
          child.params = { ...route.params, ...child.params }
          this.finder(child, route.path)
          if (this.result.map) {
            this.set(child)
            bufChild = { ...this.result }
          }
        }
        if (!this.result.map && bufChild) this.result = bufChild
      } else {
        this.finder(route)
        if (this.result.map) this.set(route)
      }
      
      if (this.result.map) buf = { ...this.result }
    }
    if (!this.result.map && buf) this.result = buf
    return this.result
  }
}