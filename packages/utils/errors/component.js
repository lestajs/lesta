const messages = {
  201: 'section "%s" found in component template.',
  202: 'section not defined "%s".',
  203: 'src property must not be empty.',
  204: 'the iterate property is not supported for sections.',
  205: 'the iterate property expects a function.',
  206: 'the iterate function must return an array.',
  207: 'node is a section, component property is not supported.',
  208: 'node is iterable, component property is not supported.',
  209: 'the iterable component must have a template.',
  210: 'an iterable component must have only one root tag in the template.',
  211: 'parent component passes proxies, you need to accept them in props.',
  212: 'the "induce" property expects a function.',
  213: 'param "%s" is already in props.',
  214: 'proxy "%s" is already in props.',
}
const errorComponent = (name = 'root', code, param = '') => console.error(`[Lesta error ${code}]: Error creating component "${name}": ${messages[code]}`, param)

export { errorComponent }