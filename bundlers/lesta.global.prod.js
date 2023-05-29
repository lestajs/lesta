"use strict";(()=>{var ht=Object.defineProperty;var pt=(i,t)=>{for(var e in t)ht(i,e,{get:t[e],enumerable:!0})};function u(i){return i?typeof i=="object"?JSON.parse(JSON.stringify(i)):i:i??null}function Z(i,t){let e={};return i.forEach(o=>Object.assign(e,{[o]:t})),e}function k(i,t=120){return function(...o){let s=this.lastCall;this.lastCall=Date.now(),s&&this.lastCall-s<=t&&clearTimeout(this.lastCallTimer),this.lastCallTimer=setTimeout(()=>i(...o),t)}}function tt(i,t=50){let e;return function(...s){e||(e=setTimeout(()=>{i(...s),clearTimeout(e),e=null},t))}}function et(i){let t,e,o=new Promise((s,r)=>{e=()=>{o.process=!1,clearTimeout(t),r()},t=setTimeout(()=>{o.process=!1,clearTimeout(t),s()},i||0)});return o.stop=e,o.process=!0,o}function g(i,t){let e=new WeakMap;function o(a){return{getPrototypeOf(c){return{target:c,instance:"Proxy"}},set(c,h,p,E){let{path:K,ref:Y}=s(a,h),N=!1;return t.beforeSet(p,Y,()=>{if(c[h]!=null&&typeof c[h]=="object"){if(c[h]===p&&(N=!0),Reflect.has(c,h)&&r(c,h),p!=null&&typeof p=="object"){let M=JSON.stringify(p);M!==JSON.stringify(c[h])?p=JSON.parse(M):N=!0}}else Object.is(c[h],p)&&h!=="length"&&(N=!0)},M=>{p=u(M)}),N||(p!=null&&typeof p=="object"&&!e.has(p)&&(p=n(p,K)),Reflect.set(c,h,p,E),t.set&&t.set(c,K,p,Y)),!0},get(c,h,p){if(t.get){if(h===Symbol.toPrimitive)return;let{ref:E}=s(a,h);t.get(c,E)}return Reflect.get(c,h,p)},deleteProperty(c,h){return Reflect.has(c,h)?(r(c,h),Reflect.deleteProperty(c,h)):!1}}}function s(a,c){let h=[...a,c],p=h.join(".");return{path:h,ref:p}}function r(a,c){e.has(a[c])&&e.delete(a[c]);for(let h of Object.keys(a[c]))a[c][h]!=null&&typeof a[c][h]=="object"&&r(a[c],h)}function n(a,c){for(let p of Object.keys(a))a[p]!=null&&typeof a[p]=="object"&&(a[p]=n(a[p],[...c,p]));let h=new Proxy(a,o(c));return e.set(h,a),h}return n(i,[])}function l(i,t,e,o){let s=(r,n)=>{let a=r.split("."),c=n.split(".");for(let h=0;h<c.length;h++)if(a[h]!==c[h])return!1;return!0};for(let[r,n]of i)if(Array.isArray(n))n.includes(t)&&r(e);else if(s(t,n)){let a=[...o];a.shift(),r(e,a)}}function V(i,t,e){let o;for(o=0;o<t.length-1;o++)i=i[t[o]];i[t[o]]=e}async function d(i){if(typeof i=="function"){let t=i();return t instanceof Promise?(await t)?.default:void 0}return i}function A(i,t){for(let[e,o]of i)if(Array.isArray(o)){let s=o.indexOf(t);s!==-1&&(o.length===1?i.delete(e):o.splice(s,1))}else o===t&&i.delete(e)}function O(i){return new DOMParser().parseFromString(i,"text/html").body||document.createElement("body")}function z(i){function t(n){let a=n.querySelectorAll("script");for(let c of a)c.remove()}function e(n,a){let c=a.replace(/\s+/g,"").toLowerCase();if(["src","href","xlink:href"].includes(n)&&(c.includes("javascript:")||c.includes("data:text/html"))||n.startsWith("on"))return!0}function o(n){let a=n.attributes;for(let{name:c,value:h}of a)e(c,h)&&n.removeAttribute(c)}function s(n){let a=n.children;for(let c of a)o(c),s(c)}let r=O(i);return t(r),s(r),r.childNodes}function ot(){let i=new Uint32Array(4);window.crypto.getRandomValues(i);let t=-1;return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,e=>{t++;let o=i[t>>3]>>t%8*4&15;return(e==="x"?o:o&3|8).toString(16)})}var $=()=>{let i=[],t=!1,e=()=>i.length,o=()=>i.length===0,s=n=>{i.push(n),t||(t=!0,r())},r=async()=>{let n=i.at(0);n?(await n(),i.shift(),r()):t=!1};return{add:s,isEmpty:o,size:e}};function J(i){return Object.freeze(i),Object.getOwnPropertyNames(i).forEach(t=>{let e=i[t];e!==null&&(typeof e=="object"||typeof e=="function")&&!Object.isFrozen(e)&&J(e)}),i}async function R(i,t,e){await i.loaded(t),e&&await i.props(e,t),i.params(),i.methods(t),i.proxies(),await i.created(),await i.nodes(t),await i.mounted()}var W={update:(i,t)=>{let e=typeof t=="function"?t(i):t;i.innerHTML="",i.append(...z(e))}};var F={update:(i,t)=>{let e=typeof t=="function"?t(i):t;i.innerHTML=e}};var B={update:(i,t,e)=>{(typeof t[e]=="function"?t[e](i):t[e])?i.classList.add(e):i.classList.remove(e)}};var b=class{constructor(t,e,o){this.Nodes=o,this.component=t,this.app=e,this.proxiesData={},this.impress={refs:[],collect:!1,exclude(s){this.collect=!1;let r=s();return this.collect=!0,r},define(s){return s&&s.startsWith("_")?this.refs[0]:[...this.refs]},clear(){this.collect=!1,this.refs.length=0}},this.context={exclude:this.impress.exclude.bind(this.impress),container:null,options:t,node:{},param:{},method:{},proxy:{},source:t.sources,directives:{_html:W,_evalHTML:F,_class:B},router:e.router||{},component:e.components||{},root:e.root},Object.preventExtensions(this.context.source),Object.assign(this.context,e.common||{}),Object.assign(this.context.directives,t.directives||{},e.directives||{})}async loaded(t){this.context.container=t,this.component.loaded&&await this.component.loaded.bind(this.context)()}async created(){this.component.created&&await this.component.created.bind(this.context)()}async mounted(){this.component.mounted&&await this.component.mounted.bind(this.context)()}methods(t){if(t.method||(t.method={}),this.component.methods)for(let[e,o]of Object.entries(this.component.methods))this.context.method[e]=o.bind(this.context),t.method[e]=(...s)=>this.context.method[e](...u(s));Object.preventExtensions(this.context.method)}params(){if(this.component.params)for(let t in this.component.params){if(t in this.context.param)return this.app.errorComponent(container.nodepath,213,t);this.context.param[t]=this.component.params[t]}Object.preventExtensions(this.context.param)}proxies(){if(this.component.proxies)for(let t in this.component.proxies){if(t in this.proxiesData)return this.app.errorComponent(container.nodepath,214,t);this.proxiesData[t]=this.component.proxies[t]}this.context.proxy=g(this.proxiesData,{beforeSet:(t,e,o,s)=>{if(!this.component.setters||!this.component.setters[e])o();else{let r=this.component.setters[e].bind(this.context)(t);s(r)}},set:(t,e,o,s)=>{for(let r in this.context.node){let n=this.context.node[r];n.reactivity.node&&l(n.reactivity.node,s),n.reactivity.component&&l(n.reactivity.component,s,o,e);for(let a in n.section)n.section[a]?.reactivity.component&&l(n.section[a].reactivity.component,s,o,e)}this.component.handlers&&this.component.handlers[s]?.bind(this.context)(o)},get:(t,e)=>{this.impress.collect&&!this.impress.refs.includes(e)&&this.impress.refs.push(e)}}),Object.preventExtensions(this.context.proxy)}async nodes(t){if(this.component.nodes){let e=this.component.nodes.bind(this.context)();for await(let[o,s]of Object.entries(e)){let r=this.component.selectors&&this.component.selectors[o]||`.${o}`,n=t.querySelector(r)||t.classList.contains(o)&&t;if(!n)return this.app.errorNode(o,105);if(n.nodepath=t.nodepath?t.nodepath+"."+o:o,n.nodename=o,Object.assign(this.context.node,{[o]:n}),s){let a=new this.Nodes(s,this.context,n,this.impress,this.app,o);for await(let[c]of Object.entries(s))await a.controller(c)}}Object.preventExtensions(this.context.node)}}};var H=class extends b{constructor(...t){super(...t)}async destroy(t){t.reactivity&&t.reactivity.component.clear(),t.proxy={},t.method={};for(let e in t.unstore)t.unstore[e]();delete t.unmount}async unmount(){if(this.context.node)for await(let t of Object.values(this.context.node)){if(t.unmount&&!t.hasAttribute("iterable")){if(t.section)for await(let e of Object.values(t.section))await e.unmount&&e.unmount();await t.unmount()}if(t.directives)for await(let e of Object.values(t.directives))e.destroy&&e.destroy();t.reactivity&&t.reactivity.node.clear()}this.component.unmount&&await this.component.unmount.bind(this.context)()}async props(t,e){if(t.proxies&&Object.keys(t.proxies).length&&!this.component.props?.proxies)return this.app.errorComponent(e.nodepath,211);if(e.proxy||(e.proxy={}),this.component.props){if(this.component.props.proxies){for(let o in t.proxies)if(!(o in this.component.props.proxies))return this.app.errorProps(e.nodepath,"proxies",o,301);for(let o in this.component.props.proxies){let s=this.component.props.proxies[o];if(typeof s!="object")return this.app.errorProps(e.nodepath,"proxies",o,302);let r=c=>{s.required&&c==null&&this.app.errorProps(e.nodepath,"proxies",o,303);let h=c??s.default??null;return s.type&&typeof h!==s.type&&this.app.errorProps(e.nodepath,"proxies",o,304,s.type),h};e.proxy[o]=(c,h)=>{h&&h.length!==0?V(this.context.proxy[o],h,c):this.context.proxy[o]=r(c)};let n=null,{store:a}=s;t.proxies&&o in t.proxies?n=t.proxies[o]:a&&(await this.app.checkStore(a),e.destorey||(e.unstore={}),e.unstore[o]=()=>{},n=this.app.store[a].proxies(o,e)),this.proxiesData[o]=u(r(n))}}for(let o in this.component.props.methods){let s=this.component.props.methods[o];if(typeof s!="object")return this.app.errorProps(e.nodepath,"methods",o,302);let{store:r}=s;if(r){await this.app.checkStore(r);let n=this.app.store[r].methods(o);if(!n)return this.app.errorProps(e.nodepath,"methods",o,305,r);this.context.method[o]=(...a)=>n(...u(a))}else{let n=t.methods&&o in t.methods;if(s.required&&!n)return this.app.errorProps(e.nodepath,"methods",o,303);n&&(this.context.method[o]=(...a)=>t.methods[o](...u(a)))}}for(let o in this.component.props.params){let s=this.component.props.params[o];if(typeof s!="object")return this.app.errorProps(e.path,"params",o,302);let{store:r}=s,n=t?.params[o];if(r){await this.app.checkStore(r);let a=this.app.store[r].params(o);this.context.param[o]=u(a)??(s.required&&this.app.errorProps(e.path,"params",o,303)||s.default)}else{let a=n instanceof Promise||n instanceof HTMLCollection||n instanceof NodeList||n instanceof Element||o.startsWith("__");this.context.param[o]=a?n:u(n)??(s.required&&this.app.errorProps(e.path,"params",o,303)||s.default)}s.type&&typeof this.context.param[o]!==s.type&&this.app.errorProps(e.path,"params",o,304,s.type),s.readonly&&Object.defineProperty(this.context.param,o,{writable:!1})}}}};var X={};pt(X,{errorComponent:()=>U,errorNode:()=>q,errorProps:()=>st,errorRouter:()=>v,errorStore:()=>x,warnRouter:()=>m});var ut={102:'incorrect directive name "%s", the name must start with the character "_".',103:'node property "%s" expects an object as its value.',104:'unknown node property: "%s".',105:"node with this name was not found in the template.",106:"innerHTML method is not secure due to XXS attacks, use _html or _evalHTML directives."},q=(i,t,e="")=>console.error(`[Lesta error ${t}]: Error in node "${i}": ${ut[t]}`,e);var mt={201:'section "%s" found in component template.',202:'section not defined "%s".',203:"src property must not be empty.",204:"the iterate property is not supported for sections.",205:"the iterate property expects a function.",206:"the iterate function must return an array.",207:"node is a section, component property is not supported.",208:"node is iterable, component property is not supported.",209:"the iterable component must have a template.",210:"an iterable component must have only one root tag in the template.",211:"parent component passes proxies, you need to accept them in props.",212:'the "induce" property expects a function.',213:'param "%s" is already in props.',214:'proxy "%s" is already in props.'},U=(i="root",t,e="")=>console.error(`[Lesta error ${t}]: Error creating component "${i}": ${mt[t]}`,e);var ft={301:"parent component passes proxies, you need to accept them in props.",302:"waiting for an object.",303:"props is required.",304:'value does not match type "%s".',305:'method not found in store "%s".'},st=(i="root",t,e,o,s="")=>console.error(`[Lesta error ${o}]: Error in props ${t} "${e}" in component "${i}": ${ft[o]}`,s);var lt={401:"store not found.",402:"loading error from sources.",403:"store methods can take only one argument of type object.",404:'middleware "%s" can take only one argument of type object.'},x=(i,t,e="")=>console.error(`[Lesta error ${t}]: Error in store "${i}": ${lt[t]}`,e);var it={501:"path not found in route.",502:"path not found in child route.",551:'name "%s" not found in routes.',552:"current route has no parameters.",553:'param "%s" not found in current route.',554:'param "%s" not found in object route.',555:'param "%s" does not match regular expression.',556:"too many redirects",557:'property "path" missing'},v=(i="",t,e="")=>console.error(`[Lesta error ${t}]: Error in route "${i}": ${it[t]}`,e),m=(i,t="")=>console.warn(`[Lesta warn ${i}]: ${it[i]}`,t);var f=class{constructor(t,e,o,s,r,n){this.app=r,this.node=t,this.context=e,this.impress=s,this.nodeElement=o,this.keyNode=n,this.nodeElement.reactivity={node:new Map}}reactive(t,e,o){t.length&&o.set(e,t),this.impress.clear()}reactiveNode(t,e){this.reactive(t,e,this.nodeElement.reactivity.node)}};var _=class{constructor(t,e,o,s){if(this.app=e,this.name=o,this.nodeElement=s,this.component=t,!this.component.src)return this.app.errorComponent(s.nodepath,203)}async props(t,e,o){let s={};return t&&(s.proxies=t),s.params=this.params(this.component.params,e,o),s.methods=this.methods(this.component.methods),s.section=this.component.section,s.name=this.name,s}methods(t){let e={};if(t)for(let[o,s]of Object.entries(t))typeof s=="function"&&Object.assign(e,{[o]:s});return e}params(t,e,o){let s={};if(t)for(let[r,n]of Object.entries(t)){let a=null;typeof n=="function"&&n.name?a=e?n(e,o):n(this.nodeElement):a=n,Object.assign(s,{[r]:a})}return s}async create(t,e,o,s){if(t){let r=await this.props(e,o,s),n=await d(t);return await this.app.mount(n,r,this.nodeElement)}}};var y=class extends f{constructor(...t){super(...t),this.nodeElement.reactivity.component=new Map}reactiveComponent(t,e,o){let s=o||this.nodeElement;this.reactive(t,e,s.reactivity.component)}reactivate(t,e,o,s,r){let n={};if(t)for(let[a,c]of Object.entries(t))if(typeof c=="function"&&c.name){this.impress.collect=!0;let h=o&&c.length?c(o[s],s):c(r);Object.assign(n,{[a]:h}),e(a,c),this.impress.clear()}else Object.assign(n,{[a]:c});return n}async section(t,e,o){let s=async(r,n)=>{e.setAttribute("integrate",""),e.section[r].unmount&&await this.nodeElement.section[r].unmount(),n.section=r,await this.create(t,e,n,o(n.proxies,e.section[n.section],n.section))};if(e.section={},this.node.component.sections)for await(let[r,n]of Object.entries(this.node.component.sections)){let a=e.querySelector(`[section="${r}"]`);if(!a)return this.app.errorComponent(e.nodepath,201,r);if(a.reactivity||(a.reactivity={component:new Map}),Object.assign(e.section,{[r]:a}),n.src)await s(r,n);else if(this.node.component.iterate)return this.app.errorComponent(a.nodepath,204);e.integrate=s}}async create(t,e,o,s,r,n){let c=await new _(o,this.app,this.keyNode,e).create(o.src,s,r,n);o.sections&&await this.section(t,c?.container,(h,p,E)=>n!==void 0?t(h,c?.container.section[E],n):t(h,p))}};var j=class extends y{constructor(...t){super(...t),this.queue=$(),this.name=null,this.created=!1}async init(){if(typeof this.node.component.iterate!="function")return this.app.errorComponent(this.nodeElement.nodepath,205);if(this.createIterate=async t=>{let e=this.proxies(this.node.component.proxies,this.nodeElement.children[t],t);await this.create(this.proxies.bind(this),this.nodeElement,this.node.component,e,this.data[t],t),this.created=!0},this.impress.collect=!0,this.data=this.node.component.iterate(),!Array.isArray(this.data))return this.app.errorComponent(this.nodeElement.nodepath,206);this.name=this.impress.refs[0],this.impress.clear(),this.nodeElement.setAttribute("iterate",""),Object.getPrototypeOf(this.data).instance==="Proxy"&&(this.reactiveComponent([this.name],async t=>{this.data=this.node.component.iterate(),t.length&&this.queue.add(async()=>{if(this.node.component.proxies){for(let[e,o]of Object.entries(this.node.component.proxies))if(typeof o=="function"&&o.name&&o.length)for(let s=0;s<Math.min(this.nodeElement.children.length,t.length);s++){let r=o(this.data[s],s);this.nodeElement.children[s].proxy[e](r),this.sections(this.node.component.sections,this.nodeElement.children[s],s)}}}),this.queue.add(async()=>await this.length(t.length))}),this.reactiveComponent([this.name+".length"],async t=>{this.queue.add(async()=>await this.length(t))}));for await(let[t]of this.data.entries())await this.createIterate(t);return this.createIterate}sections(t,e,o){if(t)for(let[s,r]of Object.entries(t))for(let[n,a]of Object.entries(r.proxies))typeof a=="function"&&a.name&&a.length&&(e.section[s]?.proxy[n](a(this.data[o],o)),this.sections(r.sections,e.section[s],o))}proxies(t,e,o){let s=(r,n)=>{this.impress.refs.some(a=>a.includes(this.name))?this.reactiveComponent(this.impress.define(r),async(a,c)=>{this.queue.add(async()=>{if(c)c.shift(),this.nodeElement.children[o]?.proxy[r](a,c);else if(this.data=this.node.component.iterate(),o<this.data.length){let h=n(this.data[o],o);this.nodeElement.children[o]?.proxy[r](h)}})},e):this.created?this.impress.clear():this.reactiveComponent(this.impress.define(r),async(a,c)=>{this.queue.add(async()=>{for(let h=0;h<this.nodeElement.children.length;h++)c?this.nodeElement.children[h].proxy[r](a,c):this.nodeElement.children[h].proxy[r](n())})},e)};return this.reactivate(t,s,this.data,o)}async length(t){this.data.length===t&&(t>this.nodeElement.children.length&&await this.add(t),t<this.nodeElement.children.length&&await this.remove(t))}async add(t){let e=this.nodeElement.children.length;for(;t>e;)await this.createIterate(e),e++}async remove(t){let e=this.nodeElement.children.length;for(;t<e;)e--,A(this.nodeElement.reactivity.component,this.name+"."+e),await this.nodeElement.children[e].unmount()}};var L=class extends y{constructor(...t){super(...t)}async init(){let t=()=>this.create(this.proxies.bind(this),this.nodeElement,this.node.component,this.proxies(this.node.component.proxies,this.nodeElement));if(this.nodeElement.refresh=async()=>{this.nodeElement.unmount&&await this.nodeElement.unmount(),await t()},this.node.component.induce){if(typeof this.node.component.induce!="function")return this.app.errorComponent(this.nodeElement.nodepath,212);this.impress.collect=!0;let e=this.node.component.induce(),o=async()=>{await t(),this.nodeElement.setAttribute("induced","")};this.reactiveNode(this.impress.define(),async()=>{let s=this.node.component.induce();this.nodeElement.hasAttribute("induced")?s||(await this.nodeElement.unmount(),this.nodeElement.removeAttribute("induced")):s&&await o()}),e&&await o()}else await t()}proxies(t,e){let o=(s,r)=>this.reactiveComponent(this.impress.define(s),(n,a)=>{e.proxy&&e.proxy[s]&&(a?e.proxy[s](n,a):e.proxy[s](r(this.nodeElement)))},e);return this.reactivate(t,o,null,null,e)}};var P=class extends f{constructor(...t){super(...t)}init(t){if(t[0]!=="_")return this.app.errorNode(this.nodeElement.nodepath,102,t);let e=this.context.directives[t],o=this.node[t],{create:s,update:r,destroy:n}=e;"directives"in this.nodeElement||Object.assign(this.nodeElement,{directives:{}}),Object.assign(this.nodeElement.directives,{[t]:{create:()=>s?s(this.nodeElement,o,e):{},destroy:()=>n?n(this.nodeElement,o,e):{}}}),s&&this.nodeElement.directives[t].create();let a=(c,h,p)=>{typeof c=="function"?(this.impress.collect=!0,r.bind(e)(this.nodeElement,h,p),this.reactiveNode(this.impress.define(),()=>r(this.nodeElement,h,p))):r.bind(e)(this.nodeElement,h,p)};if(r!=null)if(typeof o=="object")for(let c in o)a(o[c],o,c);else a(o,o)}};var C=class extends f{constructor(...t){super(...t)}listeners(t){typeof this.node[t]=="function"&&(this.nodeElement[t]=e=>this.node[t].bind(this.context)(e))}general(t){if(t==="innerHTML")return this.app.errorNode(this.nodeElement.nodepath,106);if(typeof this.node[t]=="function"){let e=()=>{let o=this.node[t].bind(this.context)(this.nodeElement);this.nodeElement[t]!==null&&typeof this.nodeElement[t]=="object"?o!==null&&typeof o=="object"?Object.assign(this.nodeElement[t],o):this.app.errorNode(this.nodeElement.nodepath,103,t):this.nodeElement[t]=o!==Object(o)?o:JSON.stringify(o)};this.impress.collect=!0,e(),this.reactiveNode(this.impress.define(),e)}else this.nodeElement[t]=this.node[t]}init(t){t.substr(0,2)==="on"?this.listeners(t):this.general(t)}};var w=class{constructor(t,e,o,s,r,n){this.app=r,this.node=t,this.context=e,this.impress=s,this.nodeElement=o,this.keyNode=n,this.directive=new P(t,e,o,s,r,n),this.native=new C(t,e,o,s,r,n)}async controller(t){t in this.nodeElement?this.native.init(t):t in this.context.directives?this.directive.init(t):t==="component"&&this.component?await this.component():this.app.errorNode(this.nodeElement.nodepath,104,t)}};var S=class extends w{constructor(...t){super(...t);let{node:e,context:o,nodeElement:s,impress:r,app:n,keyNode:a}=this;this.basic=new L(e,o,s,r,n,a),this.iterate=new j(e,o,s,r,n,a)}async component(){if(this.nodeElement.hasAttribute("section"))return this.app.errorComponent(this.nodeElement.nodepath,207);if(this.nodeElement.hasAttribute("iterable"))return this.app.errorComponent(this.nodeElement.nodepath,208);this.node.component.iterate?await this.iterate.init():await this.basic.init()}};var D=class{constructor(t,e,o){this.store=t,this.context={name:o,reactivity:new Map,param:{},method:{},router:e.router||{},source:this.store.sources},Object.assign(this.context,e.common),this.context.param=this.store.params,Object.preventExtensions(this.context.param);for(let s in this.store.methods)this.context.method[s]=(...r)=>{if(r.length&&(r.length>1||typeof r[0]!="object"))return x(this.context.name,404,s);let n={...u(r[0])};return this.store.middlewares&&s in this.store.middlewares?(async()=>{let a=await this.store.middlewares[s].bind(this.context)(n);return a&&typeof a!="object"?x(this.context.name,404,s):(n&&a&&Object.assign(n,a),this.store.methods[s].bind(this.context)(n))})():this.store.methods[s].bind(this.context)(n)};this.context.proxy=g(this.store.proxies,{beforeSet:(s,r,n,a)=>{if(!this.store.setters||!this.store.setters[r])n();else{let c=this.store.setters[r].bind(this.context)(s);a(c)}},set:async(s,r,n,a)=>{l(this.context.reactivity,a,n,r)}}),Object.preventExtensions(this.context.proxy)}created(){this.store.created&&this.store.created.bind(this.context)()}params(t){return this.context.param[t]}proxies(t,e){let o=(s,r)=>e.proxy[t](s,r);return this.context.reactivity.set(o,t),e.unstore[t]=()=>this.context.reactivity.delete(o),this.context.proxy[t]}methods(t){return this.context.method[t]}};function rt(i,t,e){let o=new D(i,t,e);t.store[e]=o,o.created()}function dt(i,t,e,o){if(o){let s=t.section[o];return s?(s.innerHTML=i.template,s.nodepath=t.nodepath+"."+o,s.nodename=o,s.unmount||(s.unmount=async()=>{s.innerHTML="",e.destroy(s),await e.unmount()}),s):U(t.nodename,202,o)}else{if(t.hasAttribute("iterate")){if(!t.iterableElement){if(!i.template)return this.app.errorComponent(t.nodepath,209);let r=O(i.template);if(r.children.length>1)return this.app.errorComponent(t.nodepath,210);t.iterableElement=r.children[0],t.innerHTML=""}let s=t.iterableElement.cloneNode(!0);return s.nodepath=t.nodepath,t.insertAdjacentElement("beforeEnd",s),t.unmount||(t.unmount=async()=>{e.destroy(t);for await(let r of t.children)await r.unmount()}),s.setAttribute("iterable",""),s.unmount=async()=>{t.children[t.children.length-1].remove(),await e.destroy(s),await e.unmount()},s}else i.template&&(t.innerHTML=i.template);return t.unmount||(t.unmount=async()=>{t.innerHTML="",e.destroy(t),await e.unmount()}),t}}function xt(i){let t={...i,...X,store:{},async checkStore(e){if(!(e in t.store)){let o=await d(i.stores[e]);if(!o)return x(e,401);rt(o,t,e)}},async mount(e,o={},s){if(t.router&&o.to&&(t.router.to=o.to,t.router.from=o.from),e){let r=new H(e,t,S),n=dt({...e},s||t.root,r,o.section);return await R(r,n,o),{options:e,context:r.context,container:n}}},async unmount(){await t.root.unmount(),t.router&&t.router.destroy()}};for(let[e,o]of Object.entries(t.stores))typeof o!="function"&&rt(o,t,e);return t.router&&t.router.init(t.root,t.mount,t.store),{mount:t.mount,unmount:t.unmount}}async function yt(i,t){let e=new b(i,{errorNode:q},w);return t.innerHTML=i.template,await R(e,t),{destroy(){t.reactivity&&t.reactivity.node.clear(),t.method={},t.innerHTML=""}}}var T=class{constructor(){this.url=decodeURI(window.location.pathname).toString().replace(/\/$/,""),this.result={path:null,map:null,target:null,to:null}}picker(t){if(t){let e={},o=this.result.path.match(/:\w+/g);o&&o.forEach((r,n)=>{e[r.substring(1)]=this.result.map[n+1]});let s={path:this.result.map.at(0)||"/",params:e,fullPath:window.location.href,hash:window.location.hash.slice(1),search:Object.fromEntries(new URLSearchParams(window.location.search)),name:t.name,extras:t.extras,rout:{path:this.result.path}};return t.extra&&(s.rout.extra=t.extra),t.name&&(s.rout.name=t.name),t.params&&(s.rout.params=t.params),t.alias&&(s.rout.alias=t.alias),t.redirect&&(s.rout.redirect=t.redirect),t.static&&(s.rout.static=t.static),s}}mapping(t){return this.url.match(new RegExp("^"+t.replace(/:\w+/g,"(\\w+)")+"$"))}find(t,e){this.result.path=e,this.result.map=this.mapping(this.result.path);let o=1;for(let s in t.route.params){let r=!1,n=t.route.params[s];if(!this.result.map&&n.optional){let a=this.result.path.replace("/:"+s,"").replace(/\/$/,"");this.result.map=this.mapping(a),r=!0}if(this.result.map&&n.regex){let a=this.result.map[o];n.regex.test(a)||r||(this.result.map=null)}r||o++}}alias(t){if(t.alias)if(Array.isArray(t.alias))for(let e of t.alias)this.find(t,e);else this.find(t,t.alias)}finder(t){this.find(t,t.path),this.result.map||this.alias(t)}set(t){this.result.to=this.picker(t.route),this.result.target=t.route}routeEach(t,e){let o={};for(let s of t)s.path||e(501,s.name),this.finder(s),this.result.map&&(this.set(s),o={...this.result});return!this.result.map&&o&&(this.result=o),this.result}};function nt(i,t,e){return i&&i[e]?(t.regex&&!t.regex.test(i[e])&&m(555,e),i[e]):(t.optional||m(554,e),"")}function I(i){return/[<>\/&"'=]/.test(i)?encodeURIComponent(i):i}function Q(i,t,e){let o="";if(!i)return"/";if(typeof i=="object")if(i.path)o=i.path;else if(i.name){let s=e.findIndex(r=>r.name===i.name);if(s!==-1){o=e[s].path;let r=e[s].route.params;for(let n in i.params)r[n]||m(553,n);for(let[n,a]of Object.entries(r)){let c=nt(i.params,a,n);o=o.replace("/:"+n,I(c))}i.search&&(o+="?"+new URLSearchParams(i.search).toString())}else m(551,i.name)}else{let s=new URL(window.location);if(i.params){Object.keys(t.params).length||m(552),o=t.rout.path;for(let r in t.params){let n=i.params[r]||t.params[r];if(n){let a=nt(i.params,n,r);o=o.replace("/:"+r,I(a))}else m(553,r)}}else o=s.pathname;if(i.search){for(let r in i.search)i.search[r]===""?s.searchParams.delete(r):s.searchParams.set(I(r),I(i.search[r]));o+=s.search}}else o=i;return o=o.replace(/\/$/,"").replace(/^([^/])/,"/$1"),o||"/"}function at(i,t,e,o="",s={},r={}){i.forEach(n=>{if(!n.hasOwnProperty("path"))return e(n.name,557);let a=o+n.path.replace(/\/$/,""),c={...s,...n.params};n.params=c;let h={...r,...n.extra};n.extras=h,t.push({name:n.name,path:a,route:n}),n.children&&at(n.children,t,e,a,c,h)})}var ct=at;var G=class{constructor(t){this.routes=t.routes,this.from=null,this.to=null,this.current=null,this.currentLayout=null,this.afterEach=t.afterEach,this.beforeEach=t.beforeEach,this.beforeEnter=t.beforeEnter,this.afterEnter=t.afterEnter,this.list=[],this.next={},this.numRedirects=0,this.prevUrl="",t.cspContent&&this.CSP(t.cspContent),this.push=async e=>{if(this.redirection())return;let o=this.link(e);return e.replace?history.replaceState(null,null,o):history.pushState(null,null,o),await this.update(),o},this.link=e=>Q(e,this.to,this.list),this.go=e=>history.go(e)}CSP(t){let e=document.createElement("meta");e.httpEquiv="Content-Security-Policy",e.content=t,document.head.appendChild(e)}init(t,e,o){this.root=t,this.mount=e,this.stores=o,window.addEventListener("popstate",this.update.bind(this)),this.root.addEventListener("click",this.links.bind(this)),ct(this.routes,this.list,v),this.update()}destroy(){window.removeEventListener("popstate",this.update.bind(this)),this.root.removeEventListener("click",this.links.bind(this))}links(t){let e=t.target.closest("a[link]");e&&(t.preventDefault(),e&&e.href&&!e.hash&&this.push({path:e.getAttribute("href"),replace:e.hasAttribute("replace")}))}redirection(){if(this.numRedirects>10)return v(this.to.name||this.to.path,556),this.numRedirects=0,!0;let t=window.location.href;t===this.prevUrl&&this.numRedirects++,this.prevUrl=t}setName(t,e){this.root.setAttribute("name",t||""),this.root.nodepath=t||"",e&&this.root.setAttribute("layout",e)}async routeUpdate(t){t.options.routeUpdate&&await t.options.routeUpdate.bind(t.context)(this.to,this.from)}async hooks(t,e,o){if(t&&this.next!==t){let s=await t(e,o);if(s)return this.next=t,this.push(s),!0}}async update(){if(await this.hooks(this.beforeEach,this.to,this.from))return;let t=new T,{target:e,to:o}=t.routeEach(this.list,v);if(e){let s=this.to?{...this.to}:null;if(this.from=s,this.to=o,await this.hooks(this.beforeEnter,o,s)||await this.hooks(e.beforeEnter,o,s))return;for await(let r of Object.values(this.stores))if(await this.hooks(r.store.beforeEnter?.bind(r.context),o,s))return;if(e.redirect){let r=e.redirect;typeof r=="function"?this.push(await r(o,s)):this.push(r);return}if(s?.path===o.path)await this.routeUpdate(this.current);else if(e.static&&this.current){window.location.href=o.fullPath;return}else if(e.component){let r=await d(e.component);r.layout?this.currentLayout?.options===r.layout?(await this.routeUpdate(this.currentLayout),this.currentLayout.options.routerView.unmount&&await this.currentLayout.options.routerView.unmount()):(this.root.unmount&&await this.root.unmount(),this.currentLayout=await this.mount(r.layout,{to:o,from:s},this.root),this.currentLayout.options.routerView=this.root.querySelector("[router]"),await this.routeUpdate(this.currentLayout)):(this.currentLayout=null,this.root.unmount&&await this.root.unmount()),document.title=e.title||"Lesta",this.setName(e.name,e.layout),this.current=await this.mount(r,{to:o,from:s},this.currentLayout?.options.routerView||this.root),await this.routeUpdate(this.current)}if(await this.hooks(this.afterEnter,o,s)||await this.hooks(e.afterEnter,o,s))return;for await(let r of Object.values(this.stores))if(await this.hooks(r.store.afterEnter?.bind(r.context),o,s))return}await this.hooks(this.afterEach,this.to,this.from)||(this.next={})}};function wt(i){let t=new G(i),{init:e,push:o,link:s,go:r}=t;return{init:e.bind(t),push:o.bind(t),link:s.bind(t),go:r}}})();