import { lifecycle } from '../../lifecycle'
import { Init } from '../../init'
import * as catcher from '../../utils/catcher'
import Nodes from '../../nodes'
import { load, stringToHTML } from '../../utils'
import { Store } from '../../store'

function createStore(module, app, key) {
  const store = new Store(module, app, key)
  app.store[key] = store
  store.created()
}

function createComponent(options, nodeElement, component, section) {
  if (section) {
    const sectionNode = nodeElement.section[section]
    if (!sectionNode) return catcher.errorComponent(nodeElement.nodename, 202, section)
    sectionNode.innerHTML = options.template
    sectionNode.nodepath = nodeElement.nodepath + '.' + section
    sectionNode.nodename = section
    if (!sectionNode.unmount) sectionNode.unmount = async () => {
      sectionNode.innerHTML = ''
      component.destroy(sectionNode)
      await component.unmount()
    }
    return sectionNode
  } else {
    if (nodeElement.hasAttribute('iterate')) {
      if (!nodeElement.iterableElement) {
        if (!options.template) return this.app.errorComponent(nodeElement.nodepath, 209)
        const template = stringToHTML(options.template)
        if (template.children.length > 1) return this.app.errorComponent(nodeElement.nodepath, 210)
        nodeElement.iterableElement = template.children[0]
        nodeElement.innerHTML = ''
      }
      const iterableElement = nodeElement.iterableElement.cloneNode(true)
      iterableElement.nodepath = nodeElement.nodepath
      nodeElement.insertAdjacentElement('beforeEnd', iterableElement)
      if (!nodeElement.unmount) nodeElement.unmount = async () => {
        component.destroy(nodeElement)
        for await (const child of nodeElement.children) {
          await child.unmount()
        }
      }
      iterableElement.setAttribute('iterable', '')
      iterableElement.unmount = async () => {
        nodeElement.children[nodeElement.children.length - 1].remove()
        await component.destroy(iterableElement)
        await component.unmount()
      }
      return iterableElement
    } else if (options.template) {
      nodeElement.innerHTML = options.template
    }
    if (!nodeElement.unmount) nodeElement.unmount = async () => {
      nodeElement.innerHTML = ''
      component.destroy(nodeElement)
      await component.unmount()
    }
    return nodeElement
  }
}

function createApp(entry) {
  const app = {
    ...entry,
    ...catcher,
    store: {},
    async checkStore(key) {
      if (!(key in app.store)) {
        const module = await load(entry.stores[key])
        if (!module) return catcher.errorStore(key, 401)
        createStore(module, app, key)
      }
    },
    async mount(options, props = {}, nodeElement) {
      if (app.router && props.to) {
        app.router.to = props.to
        app.router.from = props.from
      }
      if (options) {
        const component = new Init(options, app, Nodes)
        const container = createComponent({...options}, nodeElement || app.root, component, props.section)
        await lifecycle(component, container, props)
        return {options, context: component.context, container}
      }
    },
    async unmount() {
      await app.root.unmount()
      app.router && app.router.destroy()
    }
  }
  if (app.stores) {
    for (const [key, module] of Object.entries(app.stores)) {
      if (typeof module !== 'function') createStore(module, app, key)
    }
  }
  app.router && app.router.init(app.root, app.mount, app.store)
  return { mount: app.mount, unmount: app.unmount }
}
export { createApp }