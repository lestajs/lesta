import Components from '../index'
import { deleteReactive } from '../../../utils'

export default class Iterate extends Components {
    constructor(...args) {
        super(...args)
        this.queue = []
        this.processing = false
        this.name = null
        this.created = false
    }
    async init() {
        if (typeof this.node.component.iterate !== 'function') return this.app.errorComponent(this.nodeElement.nodepath, 205)
        this.createIterate = async (index) => {
            const proxies = this.proxies(this.node.component.proxies, this.nodeElement.children[index], index)
            await this.create(this.proxies.bind(this), this.nodeElement, this.node.component, proxies, this.data[index], index)
            this.created = true
        }
        this.impress.collect = true
        this.data = this.node.component.iterate()
        if (!Array.isArray(this.data)) return this.app.errorComponent(this.nodeElement.nodepath, 206)
        this.name = this.impress.refs[0]
        this.impress.clear()
        this.nodeElement.setAttribute('iterate', '')
        if (Object.getPrototypeOf(this.data).instance === 'Proxy') {
            this.reactiveComponent([this.name], async (v) => {
                this.data = this.node.component.iterate()
                if (v.length) this.flow(async () => {
                    if (this.node.component.proxies) {
                        for (const [pr, fn] of Object.entries(this.node.component.proxies)) {
                            if (typeof fn === 'function' && fn.name) {
                                if (fn.length) {
                                    for (let i = 0; i < Math.min(this.nodeElement.children.length, v.length); i++) {
                                        const v = fn(this.data[i], i)
                                        this.nodeElement.children[i].proxy[pr](v)
                                        this.sections(this.node.component.sections, this.nodeElement.children[i], i)
                                    }
                                }
                            }
                        }
                    }
                })
                this.flow(async () => await this.length(v.length))
            })
            this.reactiveComponent([this.name + '.length'], async (v) => {
                this.flow(async () => await this.length(v))
            })
        }
        for await (const [index] of this.data.entries()) {
            await this.createIterate(index)
        }
        return this.createIterate
    }
    sections(sections, target, index) {
        if (sections) {
            for (const [section, options] of Object.entries(sections)) {
                for (const [p, f] of Object.entries(options.proxies)) {
                    if (typeof f === 'function' && f.name) {
                        if (f.length) {
                            target.section[section]?.proxy[p](f(this.data[index], index))
                            this.sections(options.sections, target.section[section], index)
                        }
                    }
                }
            }
        }
    }
    async flow(fn) {
        this.queue.push(fn)
        if (!this.processing) {
            this.processing = true
            while (this.queue.length) {
                const action = this.queue.shift()
                await action()
            }
            this.processing = false
        }
    }
    proxies(proxies, target, index) {
        const reactive = (pr, fn) => {
            if (this.impress.refs.some(ref => ref.includes(this.name))) {
                this.reactiveComponent(this.impress.define(pr), async (v, p) => {
                    this.flow(async () => {
                        if (p) {
                            p.shift()
                            this.nodeElement.children[index]?.proxy[pr](v, p)
                        } else {
                            this.data = this.node.component.iterate()
                            if (index < this.data.length) {
                                const val = fn(this.data[index], index)
                                this.nodeElement.children[index]?.proxy[pr](val)
                            }
                        }
                    })
                }, target)
            } else {
                if (!this.created) {
                    this.reactiveComponent(this.impress.define(pr), async (v, p) => {
                        this.flow(async () => {
                            for (let i = 0; i < this.nodeElement.children.length; i++) {
                                p ? this.nodeElement.children[i].proxy[pr](v, p) : this.nodeElement.children[i].proxy[pr](fn())
                            }
                        })
                    }, target)
                } else this.impress.clear()
            }
        }
        return this.reactivate(proxies, reactive, this.data, index)
    }
    async length(length) {
        if (this.data.length === length) {
            length > this.nodeElement.children.length && await this.add(length)
            length < this.nodeElement.children.length && await this.remove(length)
        }
    }
    async add(length) {
        let qty = this.nodeElement.children.length
        while (length > qty) {
            await this.createIterate(qty)
            qty++
        }
    }
    async remove(length) {
        let qty = this.nodeElement.children.length
        while (length < qty) {
            qty--
            deleteReactive(this.nodeElement.reactivity.component, this.name + '.' + qty)
            await this.nodeElement.children[qty].unmount()
        }
    }
}