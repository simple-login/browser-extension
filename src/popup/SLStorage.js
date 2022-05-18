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
    EXTRA_ALLOWED_DOMAINS: [],
  };

  static DEFAULT_SETTINGS = {
    [SLStorage.SETTINGS.API_URL]: devConfig
      ? devConfig.DEFAULT_API_URL
      : "https://app.simplelogin.io",
    [SLStorage.SETTINGS.API_KEY]: "",
    [SLStorage.SETTINGS.NOT_ASKING_RATE]: false,
    [SLStorage.SETTINGS.SHOW_SL_BUTTON]: true,
    [SLStorage.SETTINGS.SL_BUTTON_POSITION]: "right-inside",
    [SLStorage.SETTINGS.EXTRA_ALLOWED_DOMAINS]: devConfig
      ? devConfig.EXTRA_ALLOWED_DOMAINS
      : []
  };

  static set(key, value) {
    return browser.storage.sync.set({ [key]: value });
  }

  static async get(key) {
    const data = await browser.storage.sync.get(key);

    if (data[key] === undefined || data[key] === null) {
      return SLStorage.DEFAULT_SETTINGS[key] || "";
    } else {
      return data[key];
    }
  }

  static remove(key) {
    return browser.storage.sync.remove(key);
  }

  static clear() {
    return browser.storage.sync.clear();
  }

  static setTemporary(key, value) {
    TEMP[key] = Utils.cloneObject(value);
  }

  static getTemporary(key) {
    return TEMP[key];
  }
}

export default SLStorage;
