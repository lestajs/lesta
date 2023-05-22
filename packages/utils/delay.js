function delay(delay) {
  let timer, stop
  const promise = new Promise((resolve, reject) => {
    stop = () => {
      promise.process = false
      clearTimeout(timer)
      reject()
    }
    timer = setTimeout(() => {
      promise.process = false
      clearTimeout(timer)
      resolve()
    }, delay || 0)
  })
  promise.stop = stop
  promise.process = true
  return promise
}

export { delay }
