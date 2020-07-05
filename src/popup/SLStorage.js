class SLStorage {
  static SETTINGS = {
    API_URL: 'apiUrl',
    API_KEY: 'apiKey',
  }

  static set(key, value) {
    return new Promise(resolve => {
      chrome.storage.sync.set({ [key]: value }, function () {
        resolve();
      });
    });
  }

  static get(key) {
    return new Promise(resolve => {
      chrome.storage.sync.get(key, function (data) {
        resolve(data[key] || '');
      });
    });
  }

  static remove(key) {
    return SLStorage.set(key, '');
  }
}

export default SLStorage;