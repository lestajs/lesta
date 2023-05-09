const interpolators = {
  number: (a, b, t) => a + (b - a) * t,
  object: (a, b, t) => {
    const result = {}
    for (const key in b) {
      result[key] = interpolators[typeof b[key]](a[key], b[key], t)
    }
    return result
  },
  array: (a, b, t) => {
    const result = []
    for (let i = 0; i < b.length; i++) {
      result[i] = interpolators[typeof b[i]](a[i], b[i], t)
    }
    return result
  },
  string: (a, b, t) => {
    const result = (t < 0.5) ? a : b
    const length = Math.round(result.length * t)
    return result.slice(0, length)
  },
  boolean: (a, b, t) => {
    return (t < 0.5) ? a : b
  }
}

export { interpolators }