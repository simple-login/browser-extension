const TEMP = {};

class SLStorage {
  static SETTINGS = {
    API_URL: "apiUrl",
    API_KEY: "apiKey",
    NOT_ASKING_RATE: "notAskingRate",
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
        resolve(data[key] || "");
      });
    });
  }

  static remove(key) {
    return SLStorage.set(key, "");
  }

  static setTemporary(key, value) {
    TEMP[key] = value;
  }

  static getTemporary(key) {
    return TEMP[key];
  }
}

export default SLStorage;
