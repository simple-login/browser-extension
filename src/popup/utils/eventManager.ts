import type {MaybePromise} from '../types'

const listeners: Record<string, ((data?: Record<string, unknown>) => MaybePromise<void>)[]> = {}

const settingsChangedEvent = 'settings_changed'

const addListener = (eventName: string, callback: () => void) => {
  if (!listeners[eventName]) {
    listeners[eventName] = []
  }
  if (listeners[eventName].indexOf(callback) === -1) {
    // make sure the callback function is added only once
    listeners[eventName].push(callback)
  }
}

const removeListener = (callback: unknown) => {
  for (const eventCallbacks of Object.values(listeners)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const index = eventCallbacks.indexOf(callback as any)
    if (index !== -1) {
      eventCallbacks.splice(index, 1)
    }
  }
}

const broadcast = (eventName: string, data?: Record<string, unknown>) => {
  if (listeners[eventName]) {
    for (const callback of listeners[eventName]) {
      callback(data)
    }
  }
}

export default {
  settingsChangedEvent,
  addListener,
  removeListener,
  broadcast,
}
