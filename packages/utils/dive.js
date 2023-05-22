import { replicate } from "./index"

function dive(target, handler) {
  const preproxy = new WeakMap()
  function makeHandler(p) {
    return {
      getPrototypeOf(target) {
        return {target, instance: 'Proxy'}
      },
      set(target, key, value, receiver) {
        const { path, ref } = nav(p, key)
        let reject = false
        handler.beforeSet(value, ref, () => {
          if (target[key] != null && typeof target[key] === 'object') {
            if (target[key] === value) reject = true
            if (Reflect.has(target, key)) unproxy(target, key)
            if (value != null && typeof value === 'object') {
              const s = JSON.stringify(value)
              if (s !== JSON.stringify(target[key])) {
                value = JSON.parse(s)
              } else reject = true
            }
          } else if (Object.is(target[key], value) && key !== 'length') reject = true
        }, (v) => {
          value = replicate(v)
        })
        if (reject) return true
        if (value != null && typeof value === 'object' && !preproxy.has(value)) {
          value = proxify(value, path)
        }
        Reflect.set(target, key, value, receiver)
        if (handler.set) handler.set(target, path, value, ref)
        return true
      },
      get(target, key, receiver) {
        if (handler.get) {
          if (key === Symbol.toPrimitive) return
          const { ref } = nav(p, key)
          handler.get(target, ref)
        }
        return Reflect.get(target, key, receiver)
      },
      deleteProperty(target, key) {
        if (Reflect.has(target, key)) {
          unproxy(target, key)
          return Reflect.deleteProperty(target, key)
        }
        return false
      }
    }
  }
  function nav(p, k) {
    const path = [...p, k]
    const ref = path.join('.')
    return { path, ref }
  }
  function unproxy(obj, key) {
    if (preproxy.has(obj[key])) {
      preproxy.delete(obj[key])
    }
    for (let k of Object.keys(obj[key])) {
      if (obj[key][k] != null && typeof obj[key][k] === 'object') {
        unproxy(obj[key], k)
      }
    }
  }
  function proxify(obj, path) {
    for (const key of Object.keys(obj)) {
      if (obj[key] != null && typeof obj[key] === 'object') {
        obj[key] = proxify(obj[key], [...path, key])
      }
    }
    const p = new Proxy(obj, makeHandler(path))
    preproxy.set(p, obj)
    return p
  }
  return proxify(target, [])
}

export { dive }