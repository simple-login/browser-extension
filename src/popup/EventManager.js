const listeners = {};

class EventManager {
  static EVENT = {
    APP_LOADED: "app_loaded",
    LOADING_OVERLAY: "loading_overlay",
    SHOW_MESSAGE: "show_message",
    SHOW_ERROR: "show_error",
    SETTINGS_CHANGED: "settings_changed",
    ROUTE_CHANGED: "route_changed",
  };

  static addListener(eventName, callback) {
    if (!listeners[eventName]) {
      listeners[eventName] = [];
    }
    if (listeners[eventName].indexOf(callback) === -1) {
      // make sure the callback function is added only once
      listeners[eventName].push(callback);
    }
  }

  static removeListener(callback) {
    for (const eventCallbacks of Object.values(listeners)) {
      const index = eventCallbacks.indexOf(callback);
      if (index !== -1) {
        eventCallbacks.splice(index, 1);
      }
    }
  }

  static broadcast(eventName, data) {
    if (listeners[eventName]) {
      for (const callback of listeners[eventName]) {
        callback(data);
      }
    }
  }
}

export default EventManager;
