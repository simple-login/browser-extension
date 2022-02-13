import Utils from "./Utils";
import browser from "webextension-polyfill";

const TEMP = {};

class SLStorage {
  static SETTINGS = {
    API_URL: "apiUrl",
    API_KEY: "apiKey",
    NOT_ASKING_RATE: "notAskingRate",
    SHOW_SL_BUTTON: "showSLButton",
    SL_BUTTON_POSITION: "SLButtonPosition",
  };

  static TYPES = {
    apiUrl: "local",
    apiKey: "local",
    notAskingRate: "sync",
    showSLButton: "sync",
    SLButtonPosition: "sync"
  }

  static DEFAULT_SETTINGS = {
    [SLStorage.SETTINGS.API_URL]: devConfig
      ? devConfig.DEFAULT_API_URL
      : "https://app.simplelogin.io",
    [SLStorage.SETTINGS.API_KEY]: "",
    [SLStorage.SETTINGS.NOT_ASKING_RATE]: false,
    [SLStorage.SETTINGS.SHOW_SL_BUTTON]: true,
    [SLStorage.SETTINGS.SL_BUTTON_POSITION]: "right-inside",
  };

  static set(key, value) {
    const type = this.TYPES[key];
    return browser.storage[type].set({ [key]: value });
  }

  static async get(key) {
    const type = this.TYPES[key];
    const data = await browser.storage[type].get(key);

    if (data[key] === undefined || data[key] === null) {
      return SLStorage.DEFAULT_SETTINGS[key] || "";
    } else {
      return data[key];
    }
  }

  static remove(key) {
    const type = this.TYPES[key];
    return browser.storage[type].remove(key);
  }

  static async clear() {
    await browser.storage.local.clear();
    return browser.storage.sync.clear();
  }

  static setTemporary(key, value) {
    TEMP[key] = Utils.cloneObject(value);
  }

  static getTemporary(key) {
    return TEMP[key];
  }

  static async convertFromSyncToLocal(key) {
    const data = await browser.storage.sync.get(key);
    if (data[key]) {
      await browser.storage.local.set({ [key]: data[key] }).then(_ => browser.storage.sync.remove(key));
    }
  }
}

export default SLStorage;
