import { load } from '../utils'
import Route from  './route'
import link from './link'
import names from './names'
import { errorRouter } from '../utils/catcher'

class Router {
  constructor(options) {
    this.current = { options: {}, context: {}, path: '' }
    this.routes = options.routes
    this.from = {}
    this.to = {}
    this.currentLayout = null
    this.afterEach = options.afterEach
    this.beforeEach = options.beforeEach
    this.names = {}
    this.next = {}
    this.numRedirects = 0
    this.prevUrl = ''
    options.cspContent && this.CSP(options.cspContent)
    this.push = async (v) => {
      if (this.redirection()) return
      const url = this.link(v)
      v.replace ? history.replaceState(null, null, url) : history.pushState(null, null, url)
      await this.update()
      return url
    }
    this.link = (v) => {
      return link(v, this.to, this.names)
    }
    this.go = (v) => history.go(v)
  }
  CSP(content) {
    const meta = document.createElement('meta')
    meta.httpEquiv = 'Content-Security-Policy'
    meta.content = content
    document.head.appendChild(meta)
  }
  init(root, mount, stores) {
    this.root = root
    this.mount = mount
    this.stores = stores
    window.addEventListener('popstate', this.update.bind(this))
    this.root.addEventListener('click', this.links.bind(this))
    names(this.routes, this.names)
    this.update()
  }
  destroy() {
    window.removeEventListener('popstate', this.update.bind(this))
    this.root.removeEventListener('click', this.links.bind(this))
  }
  links(event) {
    const a = event.target.closest('a[link]')
    if (a) {
      event.preventDefault()
      if (a && a.href && !a.hash) {
        this.push({ path: a.getAttribute('href'), replace: a.hasAttribute('replace') })
      }
    }
  }
  redirection() {
    if (this.numRedirects > 10) {
      errorRouter(this.to.name || this.to.path,556)
      this.numRedirects = 0
      return true
    }
    const currentUrl = window.location.href
    if (currentUrl === this.prevUrl) {
      this.numRedirects++
    }
    this.prevUrl = currentUrl
  }
  setName(name, layout) {
    this.root.setAttribute('name', name || '')
    this.root.nodepath = name || ''
    layout && this.root.setAttribute('layout', layout)
  }
  async getProps(route) {
    if(route.params) {
      return { params: typeof route.params === 'function' ? await route.params(this.to, this.from) : route.params}
    }
  }
  async routeUpdate(component) {
    component.options.routeUpdate && await component.options.routeUpdate.bind(component.context)(this.to, this.from)
  }
  async hooks(hook, to, from) {
    if (hook && this.next !== hook) {
      const res = await hook(to, from)
      if (res) {
        this.next = hook
        this.push(res)
        return true
      }
    }
  }
  async update() {
    if (await this.hooks(this.beforeEach, null, this.from)) return
    const route = new Route()
    const { target, to } = route.routeEach(this.routes, errorRouter)
    if (target) {
      const from = {...this.to}
      this.from = from
      this.to = to
      if (target.redirect) {
        let v = target.redirect
        typeof target.redirect === 'function' ? this.push(await v(to, from)) : this.push(v)
        return true
      }
      if (await this.hooks(target.beforeEnter, to, from)) return
      for await (const [_, module] of Object.entries(this.stores)) {
        if (await this.hooks(module.store.beforeEnter?.bind(module.context), to, from)) return
      }
      if (from.rout?.path === target.path) {
        await this.routeUpdate(this.current)
      } else {
        const component = await load(target.component)
        this.current.path = target.path
        if (!component.layout) {
          this.currentLayout = null
          this.root.unmount && await this.root.unmount()
        } else if (this.currentLayout?.options === component.layout) {
          await this.routeUpdate(this.currentLayout)
          this.currentLayout.options.routerView.unmount && await this.currentLayout.options.routerView.unmount()
        } else {
          this.root.unmount && await this.root.unmount()
          component.layout.router = {push: this.push.bind(this), ...to}
          this.currentLayout = await this.mount(component.layout, await this.getProps(target), this.root)
          this.currentLayout.options.routerView = this.root.querySelector('[router]')
        }
        component.router = {push: this.push.bind(this), ...to}
        this.current = await this.mount(component, await this.getProps(target), this.currentLayout?.options.routerView || this.root)
        document.title = target.title || 'Lesta'
        this.setName(target.name, target.layout)
      }
      if (await this.hooks(target.afterEnter, to, from)) return
      for await (const [_, module] of Object.entries(this.stores)) {
        if (await this.hooks(module.store.afterEnter?.bind(module.context), to, from)) return
      }
    }
    if (await this.hooks(this.afterEach, this.to, this.from)) return
    this.next = {}
  }
}

function createRouter(options) {
  const router = new Router(options)
  const { init, to, from, push, link, go } = router
  return {
    init: init.bind(router),
    push: push.bind(router),
    link: link.bind(router),
    go,
    to,
    from
  }
}

export { createRouter }