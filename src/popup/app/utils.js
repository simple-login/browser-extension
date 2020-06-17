import Vue from 'vue';

const DEFAULT_API = "https://app.simplelogin.io";
var broadcastSettingsChangedCallback = () => {};

class Utils {
  static getDefautAPI() {
    return DEFAULT_API;
  }

  static getInitialData() {
    const isFirefox = typeof InstallTrigger !== "undefined",
      isChrome =
        !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime),
      firefoxExtensionUrl =
        "https://addons.mozilla.org/en-GB/firefox/addon/simplelogin/",
      chromeExtensionUrl =
        "https://chrome.google.com/webstore/detail/simplelogin-your-anti-spa/dphilobhebphkdjbpfohgikllaljmgbn";
    const extensionUrl = isFirefox ? firefoxExtensionUrl : chromeExtensionUrl;
    return {
      loading: false,
      apiUrl: DEFAULT_API,
  
      // API key
      apiKey: "",
      apiInput: "",
  
      // hostName obtained from chrome tabs query
      hostName: "",
  
      // new alias is saved here: a new alias screen will be shown
      newAlias: "",
  
      // only show options when GET /alias/options returns
      optionsReady: false,
  
      // for recommendation section
      hasRecommendation: false,
      recommendation: {},
  
      // alias info
      aliasPrefix: "",
      signedSuffix: "",
      aliasSuffixes: [],
      canCreate: false,
  
      existing: [],
  
      aliasQuery: "",
      loadMoreAlias: false,
  
      extensionUrl: extensionUrl,
  
      notAskingRate: false,
      showVoteScreen: false
    };
  }

  static async getHostName() {
    try {
      var result = await Vue.prototype.$browser.tabs.query({
        active: true,
        currentWindow: true
      });
      var url = new URL(result[0].url);
      return url.hostname;
    } catch (error) {
      // console.log(error);
      return '';
    }
  }

  static getStoredItem(key) {
    return new Promise(resolve => {
      chrome.storage.sync.get(key, data => resolve(data[key]));
    });
  }

  static async loadSavedSettings(ctx) {
    ctx.apiKey = (await Utils.getStoredItem("apiKey")) || "";
    ctx.apiInput = ctx.apiKey || "";
    ctx.hostName = await Utils.getHostName();
    ctx.apiUrl = (await Utils.getStoredItem("apiUrl")) || DEFAULT_API;
    ctx.notAskingRate = (await Utils.getStoredItem("notAskingRate"))  || false;
  }

  static broadcastSettingsChanged() {
    broadcastSettingsChangedCallback();
  }

  static listenSettingsChanged(callback) {
    broadcastSettingsChangedCallback = callback;
  }
}

export default Utils;