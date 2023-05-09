const messages = {
  501: 'path not found in route.',
  502: 'path not found in child route.',
  551: 'name "%s" not found in routes.',
  552: 'current route has no parameters.',
  553: 'param "%s" not found in current route.',
  554: 'param "%s" not found in object route.',
  555: 'param "%s" does not match regular expression.',
  556: 'too many redirects'
}

const errorRouter = (name = '', code, param = '') => console.error(`[Lesta error ${code}]: Error in route "${name}": ${messages[code]}`, param)
const warnRouter = (code, param = '') => console.error(`[Lesta warn ${code}]: ${messages[code]}`, param)

export { errorRouter, warnRouter }