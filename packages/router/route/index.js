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
        extra: target.extra,
        name: target.name,
        rout: {
          name: target.name,
          path: this.result.path,
          params: target.params,
          alias: target.alias,
          redirect: target.redirect
        }
      }
    }
  }
  mapping(path) {
    return this.url.match(new RegExp('^' + path.replace(/:\w+/g, '(\\w+)') + '$'))
  }
  find(target, path) {
    this.result.path = path
    this.result.map = this.mapping(this.result.path)
    let index = 1
    
    for (const key in target.route.params) {
      let fl = false
      let param = target.route.params[key]
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
  alias(target) {
    if (target.alias) {
      if (Array.isArray(target.alias)) {
        for (const path of target.alias) {
          this.find(target, path)
        }
      } else {
        this.find(target, target.alias)
      }
    }
  }
  finder(target) {
    this.find(target, target.path)
    if (!this.result.map) this.alias(target)
  }
  set(target) {
    this.result.to = this.picker(target.route)
    this.result.target = target.route
  }
  routeEach(routes, errorRouter) {
    let buf = {}
    for (const route of routes) {
      if (!route.path) errorRouter(501, route.name)
      this.finder(route)
      if (this.result.map) {
        this.set(route)
        buf = { ...this.result }
      }
    }
    if (!this.result.map && buf) this.result = buf
    return this.result
  }
}