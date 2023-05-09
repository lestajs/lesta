const messages = {
  401: 'store not found.',
  402: 'loading error from sources.',
  403: 'store methods can take only one argument of type object.',
  404: 'middleware "%s" can take only one argument of type object.'
}

const errorStore = (name, code, param = '') => console.error(`[Lesta error ${code}]: Error in store "${name}": ${messages[code]}`, param)

export { errorStore }