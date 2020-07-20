const TEMP = {};

class SLStorage {
  static SETTINGS = {
    API_URL: "apiUrl",
    API_KEY: "apiKey",
    NOT_ASKING_RATE: "notAskingRate",
    SHOW_SL_BUTTON: "showSLButton",
    BETA_ENABLED: "betaEnabled",
  };

  static DEFAULT_SETTINGS = {
    [SLStorage.SETTINGS.API_URL]: devConfig
      ? devConfig.DEFAULT_API_URL
      : "https://app.simplelogin.io",
    [SLStorage.SETTINGS.API_KEY]: "",
    [SLStorage.SETTINGS.NOT_ASKING_RATE]: false,
    [SLStorage.SETTINGS.SHOW_SL_BUTTON]: true,
    [SLStorage.SETTINGS.BETA_ENABLED]: false,
  };

  static set(key, value) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [key]: value }, function () {
        resolve();
      });
    });
  }

  static get(key) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(key, function (data) {
        if (data[key] === undefined || data[key] === null) {
          resolve(SLStorage.DEFAULT_SETTINGS[key] || "");
        } else {
          resolve(data[key]);
        }
      });
    });
  }

  static remove(key) {
    return new Promise((resolve) => {
      chrome.storage.sync.remove(key, function () {
        resolve();
      });
    });
  }

  static setTemporary(key, value) {
    TEMP[key] = value;
  }

  static getTemporary(key) {
    return TEMP[key];
  }
}

export default SLStorage;
