(() => {
  // packages/utils/replicate.js
  function replicate(data) {
    if (!data)
      return data ?? null;
    return typeof data === "object" ? JSON.parse(JSON.stringify(data)) : data;
  }

  // packages/utils/dive.js
  function dive(target, handler) {
    const preproxy = /* @__PURE__ */ new WeakMap();
    function makeHandler(p) {
      return {
        getPrototypeOf(target2) {
          return { target: target2, instance: "Proxy" };
        },
        set(target2, key, value, receiver) {
          const { path, ref } = nav(p, key);
          let cancel = false;
          handler.beforeSet(value, ref, () => {
            if (target2[key] != null && typeof target2[key] === "object") {
              if (Reflect.has(target2, key))
                unproxy(target2, key);
              if (value != null && typeof value === "object") {
                const s = JSON.stringify(value);
                if (s !== JSON.stringify(target2[key])) {
                  value = JSON.parse(s);
                }
              }
            } else if (Object.is(target2[key], value) && key !== "length") {
              cancel = true;
            }
          }, (v) => {
            value = replicate(v);
          });
          if (cancel)
            return true;
          if (value != null && typeof value === "object" && !preproxy.has(value)) {
            value = proxify(value, path);
          }
          Reflect.set(target2, key, value, receiver);
          if (handler.set)
            handler.set(target2, path, value, ref);
          return true;
        },
        get(target2, key, receiver) {
          if (handler.get) {
            if (key === Symbol.toPrimitive)
              return;
            const { ref } = nav(p, key);
            handler.get(target2, ref);
          }
          return Reflect.get(target2, key, receiver);
        },
        deleteProperty(target2, key) {
          if (Reflect.has(target2, key)) {
            unproxy(target2, key);
            return Reflect.deleteProperty(target2, key);
          }
          return false;
        }
      };
    }
    function nav(p, k) {
      const path = [...p, k];
      const ref = path.join(".");
      return { path, ref };
    }
    function unproxy(obj, key) {
      if (preproxy.has(obj[key])) {
        preproxy.delete(obj[key]);
      }
      for (let k of Object.keys(obj[key])) {
        if (obj[key][k] != null && typeof obj[key][k] === "object") {
          unproxy(obj[key], k);
        }
      }
    }
    function proxify(obj, path) {
      for (const key of Object.keys(obj)) {
        if (obj[key] != null && typeof obj[key] === "object") {
          obj[key] = proxify(obj[key], [...path, key]);
        }
      }
      const p = new Proxy(obj, makeHandler(path));
      preproxy.set(p, obj);
      return p;
    }
    return proxify(target, []);
  }

  // packages/utils/active.js
  function active(reactivity, ref, value, path) {
    const match = (str1, str2) => {
      const arr1 = str1.split(".");
      const arr2 = str2.split(".");
      for (let i = 0; i < arr2.length; i++) {
        if (arr1[i] !== arr2[i]) {
          return false;
        }
      }
      return true;
    };
    for (let [fn, refs] of reactivity) {
      if (Array.isArray(refs)) {
        if (refs.includes(ref))
          fn(value);
      } else {
        if (match(ref, refs)) {
          const p = [...path];
          p.shift();
          fn(value, p);
        }
      }
    }
  }

  // packages/utils/cleanHTML.js
  function cleanHTML(str) {
    function stringToHTML() {
      const parser = new DOMParser();
      const doc = parser.parseFromString(str, "text/html");
      return doc.body || document.createElement("body");
    }
    function removeScripts(html2) {
      const scripts = html2.querySelectorAll("script");
      for (let script of scripts) {
        script.remove();
      }
    }
    function isPossiblyDangerous(name, value) {
      let val = value.replace(/\s+/g, "").toLowerCase();
      if (["src", "href", "xlink:href"].includes(name)) {
        if (val.includes("javascript:") || val.includes("data:text/html"))
          return true;
      }
      if (name.startsWith("on"))
        return true;
    }
    function removeAttributes(elem) {
      const atts = elem.attributes;
      for (let { name, value } of atts) {
        if (!isPossiblyDangerous(name, value))
          continue;
        elem.removeAttribute(name);
      }
    }
    function clean(html2) {
      const nodes = html2.children;
      for (let node of nodes) {
        removeAttributes(node);
        clean(node);
      }
    }
    const html = stringToHTML();
    removeScripts(html);
    clean(html);
    return html.childNodes;
  }

  // packages/lifecycle/index.js
  async function lifecycle(component, container2, props) {
    await component.loaded(container2);
    props && await component.props(props, container2);
    component.params();
    component.methods(container2);
    component.proxies();
    await component.created();
    await component.nodes(container2);
    await component.mounted();
  }

  // packages/init/directives/_html.js
  var _html = {
    update: (node, options) => {
      const value = typeof options === "function" ? options(node) : options;
      node.innerHTML = "";
      node.append(...cleanHTML(value));
    }
  };

  // packages/init/directives/_evalHTML.js
  var _evalHTML = {
    update: (node, options) => {
      const value = typeof options === "function" ? options(node) : options;
      node.innerHTML = value;
    }
  };

  // packages/init/directives/_class.js
  var _class = {
    update: (node, options, key) => {
      const value = typeof options[key] === "function" ? options[key](node) : options[key];
      value ? node.classList.add(key) : node.classList.remove(key);
    }
  };

  // packages/init/basic.js
  var InitBasic = class {
    constructor(component, app, Nodes2) {
      this.Nodes = Nodes2;
      this.component = component;
      this.app = app;
      this.proxiesData = {};
      this.impress = {
        refs: [],
        collect: false,
        exclude(p) {
          this.collect = false;
          const v = p();
          this.collect = true;
          return v;
        },
        define(pr) {
          if (pr && pr[0] === "_") {
            return this.refs[0];
          }
          return [...this.refs];
        },
        clear() {
          this.collect = false;
          this.refs.length = 0;
        }
      };
      this.context = {
        exclude: this.impress.exclude.bind(this.impress),
        container: null,
        options: component,
        node: {},
        param: {},
        method: {},
        proxy: {},
        source: component.sources,
        directives: { _html, _evalHTML, _class },
        router: app.router || {},
        component: app.components || {},
        root: app.root
      };
      Object.preventExtensions(this.context.source);
      Object.assign(this.context, app.common || {});
      Object.assign(this.context.directives, component.directives || {}, app.directives || {});
    }
    async loaded(container2) {
      this.context.container = container2;
      this.component.loaded && await this.component.loaded.bind(this.context)();
    }
    async created() {
      this.component.created && await this.component.created.bind(this.context)();
    }
    async mounted() {
      this.component.mounted && await this.component.mounted.bind(this.context)();
    }
    methods(container2) {
      if (!container2.method)
        container2.method = {};
      if (this.component.methods) {
        for (const [key, method] of Object.entries(this.component.methods)) {
          this.context.method[key] = method.bind(this.context);
          container2.method[key] = (...args) => this.context.method[key](...replicate(args));
        }
      }
      Object.preventExtensions(this.context.method);
    }
    params() {
      if (this.component.params) {
        for (const key in this.component.params) {
          if (key in this.context.param)
            return this.app.errorComponent(container.nodepath, 213, key);
          this.context.param[key] = this.component.params[key];
        }
      }
      Object.preventExtensions(this.context.param);
    }
    proxies() {
      if (this.component.proxies) {
        for (const key in this.component.proxies) {
          if (key in this.proxiesData)
            return this.app.errorComponent(container.nodepath, 214, key);
          this.proxiesData[key] = this.component.proxies[key];
        }
      }
      this.context.proxy = dive(this.proxiesData, {
        beforeSet: (value, ref, compare, intercept) => {
          if (!this.component.setters || !this.component.setters[ref]) {
            compare();
          } else {
            const v = this.component.setters[ref].bind(this.context)(value);
            intercept(v);
          }
        },
        set: (target, path, value, ref) => {
          for (const keyNode in this.context.node) {
            const nodeElement = this.context.node[keyNode];
            nodeElement.reactivity.node && active(nodeElement.reactivity.node, ref);
            nodeElement.reactivity.component && active(nodeElement.reactivity.component, ref, value, path);
            for (const section in nodeElement.section) {
              nodeElement.section[section]?.reactivity.component && active(nodeElement.section[section].reactivity.component, ref, value, path);
            }
          }
          this.component.handlers && this.component.handlers[ref]?.bind(this.context)(value);
        },
        get: (target, ref) => {
          if (this.impress.collect && !this.impress.refs.includes(ref)) {
            this.impress.refs.push(ref);
          }
        }
      });
      Object.preventExtensions(this.context.proxy);
    }
    async nodes(container2) {
      if (this.component.nodes) {
        const nodes = this.component.nodes.bind(this.context)();
        for await (const [keyNode, options] of Object.entries(nodes)) {
          const selector = this.component.selectors && this.component.selectors[keyNode] || `.${keyNode}`;
          const nodeElement = container2.querySelector(selector) || container2.classList.contains(keyNode) && container2;
          if (!nodeElement)
            return this.app.errorNode(keyNode, 105);
          nodeElement.nodepath = container2.nodepath ? container2.nodepath + "." + keyNode : keyNode;
          nodeElement.nodename = keyNode;
          Object.assign(this.context.node, { [keyNode]: nodeElement });
          if (options) {
            const node = new this.Nodes(options, this.context, nodeElement, this.impress, this.app, keyNode);
            for await (const [key] of Object.entries(options)) {
              await node.controller(key);
            }
          }
        }
        Object.preventExtensions(this.context.node);
      }
    }
  };

  // packages/utils/errors/node.js
  var messages = {
    102: 'incorrect directive name "%s", the name must start with the character "_".',
    103: 'node property "%s" expects an object as its value.',
    104: 'unknown node property: "%s".',
    105: "node with this name was not found in the template.",
    106: "innerHTML method is not secure due to XXS attacks, use _html or _evalHTML directives."
  };
  var errorNode = (name, code, param = "") => console.error(`[Lesta error ${code}]: Error in node "${name}": ${messages[code]}`, param);

  // packages/nodes/node.js
  var Node = class {
    constructor(node, context, nodeElement, impress, app, keyNode) {
      this.app = app;
      this.node = node;
      this.context = context;
      this.impress = impress;
      this.nodeElement = nodeElement;
      this.keyNode = keyNode;
      this.nodeElement.reactivity = { node: /* @__PURE__ */ new Map() };
    }
    reactive(refs, active2, reactivity) {
      if (refs.length)
        reactivity.set(active2, refs);
      this.impress.clear();
    }
    reactiveNode(refs, active2) {
      this.reactive(refs, active2, this.nodeElement.reactivity.node);
    }
  };

  // packages/nodes/node/directives/index.js
  var Directives = class extends Node {
    constructor(...args) {
      super(...args);
    }
    init(key) {
      if (key[0] !== "_")
        return this.app.errorNode(this.nodeElement.nodepath, 102, key);
      const directive = this.context.directives[key];
      const options = this.node[key];
      const { create, update, destroy } = directive;
      if (!("directives" in this.nodeElement))
        Object.assign(this.nodeElement, { directives: {} });
      Object.assign(this.nodeElement.directives, { [key]: {
        create: () => create ? create(this.nodeElement, options, directive) : {},
        destroy: () => destroy ? destroy(this.nodeElement, options, directive) : {}
      } });
      create && this.nodeElement.directives[key].create();
      const active2 = (v, o, k) => {
        if (typeof v === "function") {
          this.impress.collect = true;
          update.bind(directive)(this.nodeElement, o, k);
          this.reactiveNode(this.impress.define(), () => update(this.nodeElement, o, k));
        } else
          update.bind(directive)(this.nodeElement, o, k);
      };
      if (update != null) {
        if (typeof options === "object") {
          for (const k in options)
            active2(options[k], options, k);
        } else
          active2(options, options);
      }
    }
  };

  // packages/nodes/node/native/index.js
  var Native = class extends Node {
    constructor(...args) {
      super(...args);
    }
    listeners(key) {
      if (typeof this.node[key] === "function") {
        this.nodeElement[key] = (event) => this.node[key].bind(this.context)(event);
      }
    }
    general(key) {
      if (key === "innerHTML")
        return this.app.errorNode(this.nodeElement.nodepath, 106);
      if (typeof this.node[key] === "function") {
        const active2 = () => {
          const val = this.node[key].bind(this.context)(this.nodeElement);
          if (this.nodeElement[key] !== null && typeof this.nodeElement[key] === "object") {
            val !== null && typeof val === "object" ? Object.assign(this.nodeElement[key], val) : this.app.errorNode(this.nodeElement.nodepath, 103, key);
          } else
            this.nodeElement[key] = val !== Object(val) ? val : JSON.stringify(val);
        };
        this.impress.collect = true;
        active2();
        this.reactiveNode(this.impress.define(), active2);
      } else
        this.nodeElement[key] = this.node[key];
    }
    init(key) {
      if (key.substr(0, 2) === "on") {
        this.listeners(key);
      } else
        this.general(key);
    }
  };

  // packages/nodes/basic.js
  var NodesBasic = class {
    constructor(node, context, nodeElement, impress, app, keyNode) {
      this.app = app;
      this.node = node;
      this.context = context;
      this.impress = impress;
      this.nodeElement = nodeElement;
      this.keyNode = keyNode;
      this.directive = new Directives(node, context, nodeElement, impress, app, keyNode);
      this.native = new Native(node, context, nodeElement, impress, app, keyNode);
    }
    async controller(key) {
      if (key in this.nodeElement) {
        this.native.init(key);
      } else if (key in this.context.directives) {
        this.directive.init(key);
      } else if (key === "component" && this.component) {
        await this.component();
      } else {
        this.app.errorNode(this.nodeElement.nodepath, 104, key);
      }
    }
  };

  // packages/create/widget/index.js
  async function createWidget(options, root) {
    const component = new InitBasic(options, { errorNode }, NodesBasic);
    root.append(...cleanHTML(options.template));
    await lifecycle(component, root);
    return {
      destroy() {
        if (root.reactivity)
          root.reactivity.node.clear();
        root.method = {};
        root.innerHTML = "";
      }
    };
  }

  // scripts/lesta.createWidget.js
  window.lesta = { createWidget };
})();
