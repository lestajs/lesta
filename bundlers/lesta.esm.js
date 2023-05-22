var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// packages/utils/replicate.js
function replicate(data) {
  if (!data)
    return data ?? null;
  return typeof data === "object" ? JSON.parse(JSON.stringify(data)) : data;
}

// packages/utils/mapProps.js
function mapProps(arr, options) {
  const res = {};
  arr.forEach((key) => Object.assign(res, { [key]: options }));
  return res;
}

// packages/utils/debounce.js
function debounce(fn, timeout = 120) {
  return function perform(...args) {
    let previousCall = this.lastCall;
    this.lastCall = Date.now();
    if (previousCall && this.lastCall - previousCall <= timeout) {
      clearTimeout(this.lastCallTimer);
    }
    this.lastCallTimer = setTimeout(() => fn(...args), timeout);
  };
}

// packages/utils/throttling.js
function throttling(fn, timeout = 50) {
  let timer;
  return function perform(...args) {
    if (timer)
      return;
    timer = setTimeout(() => {
      fn(...args);
      clearTimeout(timer);
      timer = null;
    }, timeout);
  };
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

// packages/utils/deliver.js
function deliver(target, path, value) {
  let i;
  for (i = 0; i < path.length - 1; i++)
    target = target[path[i]];
  target[path[i]] = value;
}

// packages/utils/load.js
async function load(src) {
  if (typeof src === "function") {
    const module = src();
    if (!(module instanceof Promise))
      return;
    const res = await module;
    return res?.default;
  }
  return src;
}

// packages/utils/deleteReactive.js
function deleteReactive(reactivity, path) {
  for (let [fn, refs] of reactivity) {
    if (Array.isArray(refs)) {
      const index = refs.indexOf(path);
      if (index !== -1) {
        if (refs.length === 1) {
          reactivity.delete(fn);
        } else {
          refs.splice(index, 1);
        }
      }
    } else if (refs === path) {
      reactivity.delete(fn);
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

// packages/utils/animate/interpolators.js
var interpolators = {
  number: (a, b, t) => a + (b - a) * t,
  object: (a, b, t) => {
    const result = {};
    for (const key in b) {
      result[key] = interpolators[typeof b[key]](a[key], b[key], t);
    }
    return result;
  },
  array: (a, b, t) => {
    const result = [];
    for (let i = 0; i < b.length; i++) {
      result[i] = interpolators[typeof b[i]](a[i], b[i], t);
    }
    return result;
  },
  string: (a, b, t) => {
    const result = t < 0.5 ? a : b;
    const length = Math.round(result.length * t);
    return result.slice(0, length);
  },
  boolean: (a, b, t) => {
    return t < 0.5 ? a : b;
  }
};

// packages/utils/animate/easings.js
var easings = {
  linear: (t) => t,
  easeInQuad: (t) => t * t,
  easeOutQuad: (t) => t * (2 - t),
  easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => --t * t * t + 1,
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
};

// packages/utils/animate/index.js
function animate(initial, value, options = {}) {
  const duration = options.duration || 400;
  const delay = options.delay || 0;
  const count = options.count === "infinite" ? Infinity : options.count || 1;
  const easing = typeof options.easing === "function" ? options.easing : easings[options.easing] || easings["linear"];
  const interpolator = typeof options.interpolator === "function" ? options.interpolator : interpolators[typeof value] || interpolators["number"];
  let stop = () => {
  };
  let play = () => {
  };
  let pause = () => {
  };
  const complete = options.complete || (() => {
  });
  const process = options.process || (() => {
  });
  const promise = new Promise((resolve, reject2) => {
    let id = null;
    let stopped = true;
    let timeout = null;
    let current = null;
    let progress = null;
    let iteration = null;
    let start = null;
    stop = () => {
      delete promise.process;
      stopped = true;
      current = null;
      progress = null;
      id = null;
      start = null;
      clearTimeout(timeout);
      cancelAnimationFrame(id);
    };
    pause = () => {
      start = performance.now() - start;
      cancelAnimationFrame(id);
    };
    play = () => {
      stopped = false;
      start = performance.now() - start;
      animation();
    };
    const animation = () => {
      if (stopped)
        return resolve(current);
      const elapsed = performance.now() - start;
      iteration = Math.floor(elapsed / duration);
      const progress2 = easing(Math.min((elapsed - iteration * duration) / duration), 1);
      const end = interpolator(initial, value, progress2);
      if (iteration >= count || iteration + progress2 >= count) {
        complete(current);
        stop();
      }
      if (current !== end) {
        current = end;
        process(current, progress2, iteration);
      }
      id = requestAnimationFrame(animation);
    };
    timeout = setTimeout(() => {
      clearTimeout(timeout);
      play();
    }, delay);
  });
  promise.stop = () => stop() && reject(initial);
  promise.play = play;
  promise.pause = pause;
  promise.process = true;
  return promise;
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

// packages/init/index.js
var Init = class extends InitBasic {
  constructor(...args) {
    super(...args);
  }
  async destroy(container2) {
    if (container2.reactivity)
      container2.reactivity.component.clear();
    container2.proxy = {};
    container2.method = {};
    for (const key in container2.unstore) {
      container2.unstore[key]();
    }
    delete container2.unmount;
  }
  async unmount() {
    if (this.context.node) {
      for await (const node of Object.values(this.context.node)) {
        if (node.unmount && !node.hasAttribute("iterable")) {
          if (node.section) {
            for await (const section of Object.values(node.section)) {
              await section.unmount && section.unmount();
            }
          }
          await node.unmount();
        }
        if (node.directives) {
          for await (const directive of Object.values(node.directives)) {
            directive.destroy && directive.destroy();
          }
        }
        if (node.reactivity)
          node.reactivity.node.clear();
      }
    }
    this.component.unmount && await this.component.unmount.bind(this.context)();
  }
  async props(props, container2) {
    if (props.proxies && Object.keys(props.proxies).length && !this.component.props?.proxies)
      return this.app.errorComponent(container2.nodepath, 211);
    if (!container2.proxy)
      container2.proxy = {};
    if (this.component.props) {
      if (this.component.props.proxies) {
        for (const key in props.proxies) {
          if (!(key in this.component.props.proxies))
            return this.app.errorProps(container2.nodepath, "proxies", key, 301);
        }
        for (const key in this.component.props.proxies) {
          const prop = this.component.props.proxies[key];
          if (typeof prop !== "object")
            return this.app.errorProps(container2.nodepath, "proxies", key, 302);
          const validation = (v2) => {
            if (prop.required && (v2 === null || v2 === void 0))
              this.app.errorProps(container2.nodepath, "proxies", key, 303);
            const value = v2 ?? prop.default ?? null;
            if (prop.type && typeof value !== prop.type)
              this.app.errorProps(container2.nodepath, "proxies", key, 304, prop.type);
            return value;
          };
          container2.proxy[key] = (value, path) => {
            if (path && path.length !== 0) {
              deliver(this.context.proxy[key], path, value);
            } else {
              this.context.proxy[key] = validation(value);
            }
          };
          let v = null;
          const { store } = prop;
          if (props.proxies && key in props.proxies) {
            v = props.proxies[key];
          } else if (store) {
            await this.app.checkStore(store);
            if (!container2.destorey)
              container2.unstore = {};
            container2.unstore[key] = () => {
            };
            v = this.app.store[store].proxies(key, container2);
          }
          this.proxiesData[key] = replicate(validation(v));
        }
      }
      for (const key in this.component.props.methods) {
        const prop = this.component.props.methods[key];
        if (typeof prop !== "object")
          return this.app.errorProps(container2.nodepath, "methods", key, 302);
        const { store } = prop;
        if (store) {
          await this.app.checkStore(store);
          const method = this.app.store[store].methods(key);
          if (!method)
            return this.app.errorProps(container2.nodepath, "methods", key, 305, store);
          this.context.method[key] = (...args) => method(...replicate(args));
        } else {
          const isMethodValid = props.methods && key in props.methods;
          if (prop.required && !isMethodValid)
            return this.app.errorProps(container2.nodepath, "methods", key, 303);
          if (isMethodValid)
            this.context.method[key] = (...args) => props.methods[key](...replicate(args));
        }
      }
      for (const key in this.component.props.params) {
        const prop = this.component.props.params[key];
        if (typeof prop !== "object")
          return this.app.errorProps(container2.path, "params", key, 302);
        const { store } = prop;
        const data = props?.params[key];
        if (store) {
          await this.app.checkStore(store);
          const storeParams = this.app.store[store].params(key);
          this.context.param[key] = replicate(storeParams) ?? (prop.required && this.app.errorProps(container2.path, "params", key, 303) || prop.default);
        } else {
          const isDataValid = data instanceof Promise || data instanceof HTMLCollection || data instanceof NodeList || data instanceof Element;
          this.context.param[key] = isDataValid ? data : replicate(data) ?? (prop.required && this.app.errorProps(container2.path, "params", key, 303) || prop.default);
        }
        if (prop.type && typeof this.context.param[key] !== prop.type)
          this.app.errorProps(container2.path, "params", key, 304, prop.type);
        if (prop.readonly)
          Object.defineProperty(this.context.param, key, { writable: false });
      }
    }
  }
};

// packages/utils/catcher.js
var catcher_exports = {};
__export(catcher_exports, {
  errorComponent: () => errorComponent,
  errorNode: () => errorNode,
  errorProps: () => errorProps,
  errorRouter: () => errorRouter,
  errorStore: () => errorStore,
  warnRouter: () => warnRouter
});

// packages/utils/errors/node.js
var messages = {
  102: 'incorrect directive name "%s", the name must start with the character "_".',
  103: 'node property "%s" expects an object as its value.',
  104: 'unknown node property: "%s".',
  105: "node with this name was not found in the template.",
  106: "innerHTML method is not secure due to XXS attacks, use _html or _evalHTML directives."
};
var errorNode = (name, code, param = "") => console.error(`[Lesta error ${code}]: Error in node "${name}": ${messages[code]}`, param);

// packages/utils/errors/component.js
var messages2 = {
  201: 'section "%s" found in component template.',
  202: 'section not defined "%s".',
  203: "src property must not be empty.",
  204: "the iterate property is not supported for sections.",
  205: "the iterate property expects a function.",
  206: "the iterate function must return an array.",
  207: "node is a section, component property is not supported.",
  208: "node is iterable, component property is not supported.",
  209: "the iterable component must have a template.",
  210: "an iterable component must have only one root tag in the template.",
  211: "parent component passes proxies, you need to accept them in props.",
  212: 'the "induce" property expects a function.',
  213: 'param "%s" is already in props.',
  214: 'proxy "%s" is already in props.'
};
var errorComponent = (name = "root", code, param = "") => console.error(`[Lesta error ${code}]: Error creating component "${name}": ${messages2[code]}`, param);

// packages/utils/errors/props.js
var messages3 = {
  301: "parent component passes proxies, you need to accept them in props.",
  302: "waiting for an object.",
  303: "props is required.",
  304: 'value does not match type "%s".',
  305: 'method not found in store "%s".'
};
var errorProps = (name = "root", type, prop, code, param = "") => console.error(`[Lesta error ${code}]: Error in props ${type} "${prop}" in component "${name}": ${messages3[code]}`, param);

// packages/utils/errors/store.js
var messages4 = {
  401: "store not found.",
  402: "loading error from sources.",
  403: "store methods can take only one argument of type object.",
  404: 'middleware "%s" can take only one argument of type object.'
};
var errorStore = (name, code, param = "") => console.error(`[Lesta error ${code}]: Error in store "${name}": ${messages4[code]}`, param);

// packages/utils/errors/router.js
var messages5 = {
  501: "path not found in route.",
  502: "path not found in child route.",
  551: 'name "%s" not found in routes.',
  552: "current route has no parameters.",
  553: 'param "%s" not found in current route.',
  554: 'param "%s" not found in object route.',
  555: 'param "%s" does not match regular expression.',
  556: "too many redirects"
};
var errorRouter = (name = "", code, param = "") => console.error(`[Lesta error ${code}]: Error in route "${name}": ${messages5[code]}`, param);
var warnRouter = (code, param = "") => console.error(`[Lesta warn ${code}]: ${messages5[code]}`, param);

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

// packages/nodes/component/component.js
var Component = class {
  constructor(component, app, keyNode, nodeElement) {
    this.app = app;
    this.name = keyNode;
    this.nodeElement = nodeElement;
    this.component = component;
    if (!this.component.src)
      return this.app.errorComponent(nodeElement.nodepath, 203);
  }
  async props(proxies, val, index) {
    const result = {};
    if (proxies)
      result.proxies = proxies;
    result.params = this.params(this.component.params, val, index);
    result.methods = this.methods(this.component.methods);
    result.section = this.component.section;
    result.name = this.name;
    return result;
  }
  methods(methods) {
    const result = {};
    if (methods) {
      for (const [pr, v] of Object.entries(methods)) {
        if (typeof v === "function") {
          Object.assign(result, { [pr]: v });
        }
      }
    }
    return result;
  }
  params(params, val, index) {
    const result = {};
    if (params) {
      for (const [pr, fn] of Object.entries(params)) {
        let data = null;
        if (typeof fn === "function" && fn.name) {
          data = val ? fn(val, index) : fn(this.nodeElement);
        } else
          data = fn;
        Object.assign(result, { [pr]: data });
      }
    }
    return result;
  }
  async create(src, proxies, val, index) {
    if (src) {
      const props = await this.props(proxies, val, index);
      const options = await load(src);
      return await this.app.mount(options, props, this.nodeElement);
    }
  }
};

// packages/nodes/component/index.js
var Components = class extends Node {
  constructor(...args) {
    super(...args);
    this.nodeElement.reactivity.component = /* @__PURE__ */ new Map();
  }
  reactiveComponent(refs, active2, target) {
    const nodeElement = target || this.nodeElement;
    this.reactive(refs, active2, nodeElement.reactivity.component);
  }
  reactivate(proxies, reactive, arr, index, target) {
    const result = {};
    if (proxies) {
      for (const [pr, fn] of Object.entries(proxies)) {
        if (typeof fn === "function" && fn.name) {
          this.impress.collect = true;
          const value = arr && fn.length ? fn(arr[index], index) : fn(target);
          Object.assign(result, { [pr]: value });
          reactive(pr, fn);
          this.impress.clear();
        } else
          Object.assign(result, { [pr]: fn });
      }
    }
    return result;
  }
  async section(specialty, nodeElement, proxies) {
    const integrate = async (section, options) => {
      nodeElement.setAttribute("integrate", "");
      if (nodeElement.section[section].unmount)
        await this.nodeElement.section[section].unmount();
      options.section = section;
      await this.create(specialty, nodeElement, options, proxies(options.proxies, nodeElement.section[options.section], options.section));
    };
    nodeElement.section = {};
    if (this.node.component.sections) {
      for await (const [section, options] of Object.entries(this.node.component.sections)) {
        const sectionNode = nodeElement.querySelector(`[section="${section}"]`);
        if (!sectionNode)
          return this.app.errorComponent(nodeElement.nodepath, 201, section);
        if (!sectionNode.reactivity)
          sectionNode.reactivity = { component: /* @__PURE__ */ new Map() };
        Object.assign(nodeElement.section, { [section]: sectionNode });
        if (options.src) {
          await integrate(section, options);
        } else if (this.node.component.iterate)
          return this.app.errorComponent(sectionNode.nodepath, 204);
        nodeElement.integrate = integrate;
      }
    }
  }
  async create(specialty, nodeElement, options, proxies, value, index) {
    const component = new Component(options, this.app, this.keyNode, nodeElement);
    const result = await component.create(options.src, proxies, value, index);
    if (options.sections) {
      await this.section(specialty, result?.container, (proxies2, target, section) => {
        if (index !== void 0) {
          return specialty(proxies2, result?.container.section[section], index);
        } else {
          return specialty(proxies2, target);
        }
      });
    }
  }
};

// packages/nodes/component/iterate/index.js
var Iterate = class extends Components {
  constructor(...args) {
    super(...args);
    this.queue = [];
    this.processing = false;
    this.name = null;
    this.created = false;
  }
  async init() {
    if (typeof this.node.component.iterate !== "function")
      return this.app.errorComponent(this.nodeElement.nodepath, 205);
    this.createIterate = async (index) => {
      const proxies = this.proxies(this.node.component.proxies, this.nodeElement.children[index], index);
      await this.create(this.proxies.bind(this), this.nodeElement, this.node.component, proxies, this.data[index], index);
      this.created = true;
    };
    this.impress.collect = true;
    this.data = this.node.component.iterate();
    if (!Array.isArray(this.data))
      return this.app.errorComponent(this.nodeElement.nodepath, 206);
    this.name = this.impress.refs[0];
    this.impress.clear();
    this.nodeElement.setAttribute("iterate", "");
    if (Object.getPrototypeOf(this.data).instance === "Proxy") {
      this.reactiveComponent([this.name], async (v) => {
        this.data = this.node.component.iterate();
        if (v.length)
          this.flow(async () => {
            if (this.node.component.proxies) {
              for (const [pr, fn] of Object.entries(this.node.component.proxies)) {
                if (typeof fn === "function" && fn.name) {
                  if (fn.length) {
                    for (let i = 0; i < Math.min(this.nodeElement.children.length, v.length); i++) {
                      const v2 = fn(this.data[i], i);
                      this.nodeElement.children[i].proxy[pr](v2);
                      this.sections(this.node.component.sections, this.nodeElement.children[i], i);
                    }
                  }
                }
              }
            }
          });
        this.flow(async () => await this.length(v.length));
      });
      this.reactiveComponent([this.name + ".length"], async (v) => {
        this.flow(async () => await this.length(v));
      });
    }
    for await (const [index] of this.data.entries()) {
      await this.createIterate(index);
    }
    return this.createIterate;
  }
  sections(sections, target, index) {
    if (sections) {
      for (const [section, options] of Object.entries(sections)) {
        for (const [p, f] of Object.entries(options.proxies)) {
          if (typeof f === "function" && f.name) {
            if (f.length) {
              target.section[section]?.proxy[p](f(this.data[index], index));
              this.sections(options.sections, target.section[section], index);
            }
          }
        }
      }
    }
  }
  async flow(fn) {
    this.queue.push(fn);
    if (!this.processing) {
      this.processing = true;
      while (this.queue.length) {
        const action = this.queue.shift();
        await action();
      }
      this.processing = false;
    }
  }
  proxies(proxies, target, index) {
    const reactive = (pr, fn) => {
      if (this.impress.refs.some((ref) => ref.includes(this.name))) {
        this.reactiveComponent(this.impress.define(pr), async (v, p) => {
          this.flow(async () => {
            if (p) {
              p.shift();
              this.nodeElement.children[index]?.proxy[pr](v, p);
            } else {
              this.data = this.node.component.iterate();
              if (index < this.data.length) {
                const val = fn(this.data[index], index);
                this.nodeElement.children[index]?.proxy[pr](val);
              }
            }
          });
        }, target);
      } else {
        if (!this.created) {
          this.reactiveComponent(this.impress.define(pr), async (v, p) => {
            this.flow(async () => {
              for (let i = 0; i < this.nodeElement.children.length; i++) {
                p ? this.nodeElement.children[i].proxy[pr](v, p) : this.nodeElement.children[i].proxy[pr](fn());
              }
            });
          }, target);
        } else
          this.impress.clear();
      }
    };
    return this.reactivate(proxies, reactive, this.data, index);
  }
  async length(length) {
    if (this.data.length === length) {
      length > this.nodeElement.children.length && await this.add(length);
      length < this.nodeElement.children.length && await this.remove(length);
    }
  }
  async add(length) {
    let qty = this.nodeElement.children.length;
    while (length > qty) {
      await this.createIterate(qty);
      qty++;
    }
  }
  async remove(length) {
    let qty = this.nodeElement.children.length;
    while (length < qty) {
      qty--;
      deleteReactive(this.nodeElement.reactivity.component, this.name + "." + qty);
      await this.nodeElement.children[qty].unmount();
    }
  }
};

// packages/nodes/component/basic/index.js
var Basic = class extends Components {
  constructor(...args) {
    super(...args);
  }
  async init() {
    const createBasic = () => this.create(this.proxies.bind(this), this.nodeElement, this.node.component, this.proxies(this.node.component.proxies, this.nodeElement));
    this.nodeElement.refresh = async () => {
      this.nodeElement.unmount && await this.nodeElement.unmount();
      await createBasic();
    };
    if (this.node.component.induce) {
      if (typeof this.node.component.induce !== "function")
        return this.app.errorComponent(this.nodeElement.nodepath, 212);
      this.impress.collect = true;
      const permit = this.node.component.induce();
      const mount = async () => {
        await createBasic();
        this.nodeElement.setAttribute("induced", "");
      };
      this.reactiveNode(this.impress.define(), async () => {
        const p = this.node.component.induce();
        if (this.nodeElement.hasAttribute("induced")) {
          if (!p) {
            await this.nodeElement.unmount();
            this.nodeElement.removeAttribute("induced");
          }
        } else if (p)
          await mount();
      });
      if (permit)
        await mount();
    } else {
      await createBasic();
    }
  }
  proxies(proxies, target) {
    const reactive = (pr, fn) => this.reactiveComponent(this.impress.define(pr), (v, p) => {
      if (target.proxy && target.proxy[pr]) {
        p ? target.proxy[pr](v, p) : target.proxy[pr](fn(this.nodeElement));
      }
    }, target);
    return this.reactivate(proxies, reactive, null, null, target);
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

// packages/nodes/index.js
var Nodes = class extends NodesBasic {
  constructor(...args) {
    super(...args);
    const { node, context, nodeElement, impress, app, keyNode } = this;
    this.basic = new Basic(node, context, nodeElement, impress, app, keyNode);
    this.iterate = new Iterate(node, context, nodeElement, impress, app, keyNode);
  }
  async component() {
    if (this.nodeElement.hasAttribute("section")) {
      return this.app.errorComponent(this.nodeElement.nodepath, 207);
    }
    if (this.nodeElement.hasAttribute("iterable")) {
      return this.app.errorComponent(this.nodeElement.nodepath, 208);
    }
    if (this.node.component.iterate) {
      await this.iterate.init();
    } else {
      await this.basic.init();
    }
  }
};

// packages/store/index.js
var Store = class {
  constructor(options, app, name) {
    this.store = options;
    this.context = {
      name,
      reactivity: /* @__PURE__ */ new Map(),
      param: {},
      method: {},
      router: app.router || {},
      source: this.store.sources
    };
    Object.assign(this.context, app.common);
    this.context.param = this.store.params;
    Object.preventExtensions(this.context.param);
    for (const key in this.store.methods) {
      this.context.method[key] = (...args) => {
        if (args.length && (args.length > 1 || typeof args[0] !== "object"))
          return errorStore(this.context.name, 404, key);
        const arg = { ...replicate(args[0]) };
        if (this.store.middlewares && key in this.store.middlewares) {
          return (async () => {
            const res = await this.store.middlewares[key].bind(this.context)(arg);
            if (res && typeof res !== "object")
              return errorStore(this.context.name, 404, key);
            if (arg && res)
              Object.assign(arg, res);
            return this.store.methods[key].bind(this.context)(arg);
          })();
        } else {
          return this.store.methods[key].bind(this.context)(arg);
        }
      };
    }
    this.context.proxy = dive(this.store.proxies, {
      beforeSet: (value, ref, compare, intercept) => {
        if (!this.store.setters || !this.store.setters[ref]) {
          compare();
        } else {
          const v = this.store.setters[ref].bind(this.context)(value);
          intercept(v);
        }
      },
      set: async (target, path, value, ref) => {
        active(this.context.reactivity, ref, value, path);
      }
    });
    Object.preventExtensions(this.context.proxy);
  }
  created() {
    this.store.created && this.store.created.bind(this.context)();
  }
  params(key) {
    return this.context.param[key];
  }
  proxies(key, container2) {
    const active2 = (v, p) => container2.proxy[key](v, p);
    this.context.reactivity.set(active2, key);
    container2.unstore[key] = () => this.context.reactivity.delete(active2);
    return this.context.proxy[key];
  }
  methods(key) {
    return this.context.method[key];
  }
};

// packages/create/app/index.js
function createStore(module, app, key) {
  const store = new Store(module, app, key);
  app.store[key] = store;
  store.created();
}
function createComponent(options, nodeElement, component, section) {
  if (section) {
    const sectionNode = nodeElement.section[section];
    if (!sectionNode)
      return errorComponent(nodeElement.nodename, 202, section);
    sectionNode.innerHTML = "";
    sectionNode.append(...cleanHTML(options.template));
    sectionNode.nodepath = nodeElement.nodepath + "." + section;
    sectionNode.nodename = section;
    if (!sectionNode.unmount)
      sectionNode.unmount = async () => {
        component.destroy(sectionNode);
        await component.unmount();
        sectionNode.innerHTML = "";
      };
    return sectionNode;
  } else {
    if (nodeElement.hasAttribute("iterate")) {
      if (!nodeElement.iterableElement) {
        if (!options.template)
          return this.app.errorComponent(nodeElement.nodepath, 209);
        const template = cleanHTML(options.template);
        if (template.length > 1)
          return this.app.errorComponent(nodeElement.nodepath, 210);
        nodeElement.iterableElement = template[0];
        nodeElement.innerHTML = "";
      }
      const iterableElement = nodeElement.iterableElement.cloneNode(true);
      iterableElement.nodepath = nodeElement.nodepath;
      nodeElement.insertAdjacentElement("beforeEnd", iterableElement);
      if (!nodeElement.unmount)
        nodeElement.unmount = async () => {
          component.destroy(nodeElement);
          for await (const child of nodeElement.children) {
            await child.unmount();
          }
        };
      iterableElement.setAttribute("iterable", "");
      iterableElement.unmount = async () => {
        await component.destroy(iterableElement);
        await component.unmount();
        nodeElement.children[nodeElement.children.length - 1].remove();
      };
      return iterableElement;
    } else if (options.template) {
      nodeElement.innerHTML = "";
      nodeElement.append(...cleanHTML(options.template));
    }
    if (!nodeElement.unmount)
      nodeElement.unmount = async () => {
        component.destroy(nodeElement);
        await component.unmount();
        nodeElement.innerHTML = "";
      };
    return nodeElement;
  }
}
function createApp(options) {
  const app = {
    ...options,
    ...catcher_exports,
    store: {},
    async checkStore(key) {
      if (!(key in app.store)) {
        const module = await load(options.stores[key]);
        if (!module)
          return errorStore(key, 401);
        createStore(module, app, key);
      }
    },
    async mount(options2, props = {}, nodeElement) {
      if (options2) {
        const component = new Init(options2, app, Nodes);
        const container2 = createComponent({ ...options2 }, nodeElement || app.root, component, props.section);
        await lifecycle(component, container2, props);
        return { options: options2, context: component.context, container: container2 };
      }
    },
    async unmount() {
      await app.root.unmount();
      options.router && options.router.destroy();
    }
  };
  for (const [key, module] of Object.entries(options.stores)) {
    if (typeof module !== "function")
      createStore(module, app, key);
  }
  options.router && options.router.init(app.root, app.mount, app.store);
  return { mount: app.mount, unmount: app.unmount };
}

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

// packages/router/route/index.js
var Route = class {
  constructor() {
    this.url = decodeURI(window.location.pathname).toString().replace(/\/$/, "");
    this.result = {
      path: null,
      map: null,
      target: null,
      to: null
    };
  }
  picker(target) {
    if (target) {
      const params = {};
      const slugs = this.result.path.match(/:\w+/g);
      slugs && slugs.forEach((slug, index) => {
        params[slug.substring(1)] = this.result.map[index + 1];
      });
      return {
        path: this.result.map.at(0) || "/",
        params,
        fullPath: window.location.href,
        hash: window.location.hash.slice(1),
        search: Object.fromEntries(new URLSearchParams(window.location.search)),
        rout: { name: target.name, path: this.result.path, params: target.params, extra: target.extra }
      };
    }
  }
  mapping(path) {
    return this.url.match(new RegExp("^" + path.replace(/:\w+/g, "(\\w+)") + "$"));
  }
  find(target) {
    this.result.map = this.mapping(this.result.path);
    let index = 1;
    for (const key in target.params) {
      let fl = false;
      let param = target.params[key];
      if (!this.result.map && param.optional) {
        const p = this.result.path.replace("/:" + key, "").replace(/\/$/, "");
        this.result.map = this.mapping(p);
        fl = true;
      }
      if (this.result.map && param.regex) {
        const value = this.result.map[index];
        if (!param.regex.test(value)) {
          if (!fl)
            this.result.map = null;
        }
      }
      if (!fl)
        index++;
    }
  }
  setpath(path, parent) {
    if (parent) {
      this.result.path = (parent + path).replace(/\/$/, "");
    } else {
      this.result.path = path;
    }
  }
  finder(target, parent) {
    this.setpath(target.path, parent);
    this.find(target);
    if (!this.result.map && target.alias) {
      if (Array.isArray(target.alias)) {
        for (const path of target.alias) {
          this.setpath(path, parent);
          this.find(target);
        }
      } else {
        this.setpath(target.alias, parent);
        this.find(target);
      }
    }
  }
  set(target) {
    if (this.result.map) {
      this.result.to = this.picker(target);
      this.result.target = target;
    }
  }
  routeEach(routes, errorRouter2) {
    let buf = {};
    for (const route of routes) {
      if (!route.path)
        errorRouter2(501, route.name);
      if (route.children) {
        let bufChild = null;
        for (const child of route.children) {
          if (!child.path)
            errorRouter2(501, child.name);
          child.params = { ...route.params, ...child.params };
          this.finder(child, route.path);
          if (this.result.map) {
            this.set(child);
            bufChild = { ...this.result };
          }
        }
        if (!this.result.map && bufChild)
          this.result = bufChild;
      } else {
        this.finder(route);
        if (this.result.map)
          this.set(route);
      }
      if (this.result.map)
        buf = { ...this.result };
    }
    if (!this.result.map && buf)
      this.result = buf;
    return this.result;
  }
};

// packages/router/link.js
function replacement(params, param, key) {
  if (params && params[key]) {
    if (param.regex && !param.regex.test(params[key])) {
      warnRouter(555, key);
      return params[key];
    } else
      return params[key];
  } else if (param.optional) {
    return "";
  } else {
    warnRouter(554, key);
    return "";
  }
}
function link(v, t, n) {
  let res = "";
  if (!v)
    return "/";
  if (typeof v === "object") {
    if (v.path) {
      res = v.path;
    } else if (v.name) {
      if (v.name in n) {
        res = n[v.name].path;
        const params = n[v.name].route.params;
        for (const [key, param] of Object.entries(params)) {
          res = res.replace("/:" + key, replacement(v.params, param, key));
        }
      } else
        warnRouter(551, v.name);
    } else {
      const url = new URL(window.location);
      if (v.params) {
        if (!Object.keys(t.params).length)
          warnRouter(552);
        res = t.rout.path;
        for (const key in t.params) {
          const param = v.params[key] || t.params[key];
          if (param) {
            const r = replacement(v.params, param, key);
            res = res.replace("/:" + key, r);
          } else
            warnRouter(553, key);
        }
      }
      if (v.search) {
        for (const key in v.search) {
          v.search[key] === "" ? url.searchParams.delete(key) : url.searchParams.set(key, v.search[key]);
        }
      }
      res += url.search;
    }
  } else
    res = v;
  res = res.replace(/\/$/, "").replace(/^([^/])/, "/$1");
  return res || "/";
}

// packages/router/names.js
function names(routes, names2) {
  routes.forEach((route) => {
    if (route.children) {
      const path = route.path;
      route.children.forEach((child) => {
        if (child.name) {
          names2[child.name] = { route: child, path: path + child.path };
        }
      });
    } else if (route.name) {
      names2[route.name] = { path: route.path, params: route.params };
    }
  });
}

// packages/router/index.js
var Router = class {
  constructor(options) {
    this.current = { options: {}, context: {}, path: "" };
    this.routes = options.routes;
    this.from = {};
    this.to = {};
    this.currentLayout = null;
    this.afterEach = options.afterEach;
    this.beforeEach = options.beforeEach;
    this.names = {};
    this.next = {};
    this.numRedirects = 0;
    this.prevUrl = "";
    options.cspContent && this.CSP(options.cspContent);
    this.push = async (v) => {
      if (this.redirection())
        return;
      const url = this.link(v);
      v.replace ? history.replaceState(null, null, url) : history.pushState(null, null, url);
      await this.update();
      return url;
    };
    this.link = (v) => {
      return link(v, this.to, this.names);
    };
    this.go = (v) => history.go(v);
  }
  CSP(content) {
    const meta = document.createElement("meta");
    meta.httpEquiv = "Content-Security-Policy";
    meta.content = content;
    document.head.appendChild(meta);
  }
  init(root, mount, stores) {
    this.root = root;
    this.mount = mount;
    this.stores = stores;
    window.addEventListener("popstate", this.update.bind(this));
    this.root.addEventListener("click", this.links.bind(this));
    names(this.routes, this.names);
    this.update();
  }
  destroy() {
    window.removeEventListener("popstate", this.update.bind(this));
    this.root.removeEventListener("click", this.links.bind(this));
  }
  links(event) {
    const a = event.target.closest("a[link]");
    if (a) {
      event.preventDefault();
      if (a && a.href && !a.hash) {
        this.push({ path: a.getAttribute("href"), replace: a.hasAttribute("replace") });
      }
    }
  }
  redirection() {
    if (this.numRedirects > 10) {
      errorRouter(this.to.name || this.to.path, 556);
      this.numRedirects = 0;
      return true;
    }
    const currentUrl = window.location.href;
    if (currentUrl === this.prevUrl) {
      this.numRedirects++;
    }
    this.prevUrl = currentUrl;
  }
  setName(name, layout) {
    this.root.setAttribute("name", name || "");
    this.root.nodepath = name || "";
    layout && this.root.setAttribute("layout", layout);
  }
  async getProps(route) {
    if (route.params) {
      return { params: typeof route.params === "function" ? await route.params(this.to, this.from) : route.params };
    }
  }
  async routeUpdate(component) {
    component.options.routeUpdate && await component.options.routeUpdate.bind(component.context)(this.to, this.from);
  }
  async hooks(hook, to, from) {
    if (hook && this.next !== hook) {
      const res = await hook(to, from);
      if (res) {
        this.next = hook;
        this.push(res);
        return true;
      }
    }
  }
  async update() {
    if (await this.hooks(this.beforeEach, null, this.from))
      return;
    const route = new Route();
    const { target, to } = route.routeEach(this.routes, errorRouter);
    if (target) {
      const from = { ...this.to };
      this.from = from;
      this.to = to;
      if (target.redirect) {
        let v = target.redirect;
        typeof target.redirect === "function" ? this.push(await v(to, from)) : this.push(v);
        return true;
      }
      if (await this.hooks(target.beforeEnter, to, from))
        return;
      for await (const [_, module] of Object.entries(this.stores)) {
        if (await this.hooks(module.store.beforeEnter?.bind(module.context), to, from))
          return;
      }
      if (from.rout?.path === target.path) {
        await this.routeUpdate(this.current);
      } else {
        const component = await load(target.component);
        this.current.path = target.path;
        if (!component.layout) {
          this.currentLayout = null;
          this.root.unmount && await this.root.unmount();
        } else if (this.currentLayout?.options === component.layout) {
          await this.routeUpdate(this.currentLayout);
          this.currentLayout.options.routerView.unmount && await this.currentLayout.options.routerView.unmount();
        } else {
          this.root.unmount && await this.root.unmount();
          component.layout.router = { push: this.push.bind(this), ...to };
          this.currentLayout = await this.mount(component.layout, await this.getProps(target), this.root);
          this.currentLayout.options.routerView = this.root.querySelector("[router]");
        }
        component.router = { push: this.push.bind(this), ...to };
        this.current = await this.mount(component, await this.getProps(target), this.currentLayout?.options.routerView || this.root);
        document.title = target.title || "Lesta";
        this.setName(target.name, target.layout);
      }
      if (await this.hooks(target.afterEnter, to, from))
        return;
      for await (const [_, module] of Object.entries(this.stores)) {
        if (await this.hooks(module.store.afterEnter?.bind(module.context), to, from))
          return;
      }
    }
    if (await this.hooks(this.afterEach, this.to, this.from))
      return;
    this.next = {};
  }
};
function createRouter(options) {
  const router = new Router(options);
  const { init, to, from, push, link: link2, go } = router;
  return {
    init: init.bind(router),
    push: push.bind(router),
    link: link2.bind(router),
    go,
    to,
    from
  };
}
export {
  animate,
  createApp,
  createRouter,
  createWidget,
  debounce,
  deleteReactive,
  mapProps,
  replicate,
  throttling
};