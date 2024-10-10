const listeners: Record<string, ((data: unknown) => void)[]> = {}

class EventManager {
  static EVENT = {
    SETTINGS_CHANGED: 'settings_changed'
  } as const

  static addListener(
    eventName: (typeof this.EVENT)[keyof typeof this.EVENT],
    callback: (data: unknown) => void
  ) {
    if (!listeners[eventName]) {
      listeners[eventName] = []
    }
    if (listeners[eventName].indexOf(callback) === -1) {
      // make sure the callback function is added only once
      listeners[eventName].push(callback)
    }
  }

  static removeListener(callback: (data: unknown) => void) {
    for (const eventCallbacks of Object.values(listeners)) {
      const index = eventCallbacks.indexOf(callback)
      if (index !== -1) {
        eventCallbacks.splice(index, 1)
      }
    }
  }

  static broadcast(
    eventName: (typeof this.EVENT)[keyof typeof this.EVENT],
    data: unknown = undefined
  ) {
    if (listeners[eventName]) {
      for (const callback of listeners[eventName]) {
        callback(data)
      }
    }
  }
}

export default EventManager
