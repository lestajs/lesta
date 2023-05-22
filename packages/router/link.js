import { warnRouter } from '../utils/catcher'

function replacement(params, param, key) {
  if (params && params[key]) {
    if (param.regex && !param.regex.test(params[key])) {
      warnRouter(555, key)
      return params[key]
    } else return params[key]
  } else if (param.optional) {
    return ''
  } else {
    warnRouter(554, key)
    return ''
  }
}

function encode(v) {
  return /[<>\/&"'=]/.test(v) ? encodeURIComponent(v) : v
}

export default function link(v, t, l) {
  let res = ''
  if (!v) return '/'
  if (typeof v === 'object') {
    if (v.path) {
      res = v.path
    } else if (v.name) {
      const index = l.findIndex((e)=> e.name === v.name)
      if (index !== -1) {
        res = l[index].path
        const params = l[index].route.params
        for (const key in v.params) {
          if (!params[key]) warnRouter(553, key)
        }
        for (const [ key, param ] of Object.entries(params)) {
          const r = replacement(v.params, param, key)
          res = res.replace('/:' + key, encode(r))
        }
        if (v.search) res += '?' + (new URLSearchParams(v.search)).toString()
      } else warnRouter(551, v.name)
    } else {
      const url = new URL(window.location)
      if (v.params) {
        if (!Object.keys(t.params).length) warnRouter(552)
        res = t.rout.path
        for (const key in t.params) {
          const param = v.params[key] || t.params[key]
          if (param) {
            const r = replacement(v.params, param, key)
            res = res.replace('/:' + key, encode(r))
          } else warnRouter(553, key)
        }
      }
      if (v.search) {
        for (const key in v.search) {
          v.search[key] === '' ? url.searchParams.delete(key) : url.searchParams.set(encode(key), encode(v.search[key]))
        }
      }
      res += url.search
    }
  } else res = v
  res = res.replace(/\/$/, '').replace(/^([^/])/, '/$1')
  return res || '/'
}