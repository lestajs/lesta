import { interpolators } from './interpolators'
import { easings } from './easings'

function animate(initial, value, options = {}) {
  const duration = options.duration || 400
  const delay = options.delay || 0
  const count = options.count === 'infinite' ? Infinity : options.count || 1
  const easing = typeof options.easing === 'function' ? options.easing : easings[options.easing] || easings['linear']
  const interpolator = typeof options.interpolator === 'function' ? options.interpolator : interpolators[typeof value] || interpolators['number']
  
  let stop = () => {}
  let play = () => {}
  let pause = () => {}
  
  const complete = options.complete || (() => {})
  const process = options.process || (() => {})
  
  const promise = new Promise((resolve, reject) => {
    let id = null
    let stopped = true
    let timeout = null
    let current = null
    let progress = null
    let iteration = null
    let start = null
    
    stop = () => {
      delete promise.process
      stopped = true
      current = null
      progress = null
      id = null
      start = null
      clearTimeout(timeout)
      cancelAnimationFrame(id)
    }
  
    pause = () => {
      start = performance.now() - start
      cancelAnimationFrame(id)
    }
    
    play = () => {
      stopped = false
      start = performance.now() - start
      animation()
    }

    const animation = () => {
      
      if (stopped) return resolve(current)
      
      const elapsed = performance.now() - start
      iteration = Math.floor(elapsed / duration)
      const progress = easing(Math.min((elapsed - iteration * duration) / duration), 1)
      const end = interpolator(initial, value, progress)
  
      if (iteration >= count || iteration + progress >= count) {
        complete(current)
        stop()
      }
      if (current !== end) {
        current = end
        process(current, progress, iteration)
      }

      id = requestAnimationFrame(animation)
    }

    timeout = setTimeout(() => {
      clearTimeout(timeout)
      play()
    }, delay)

  })
  promise.stop = () => stop() && reject(initial)
  promise.play = play
  promise.pause = pause
  promise.process = true
  return promise
}

export { animate }