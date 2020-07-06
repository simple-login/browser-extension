const browser = require("webextension-polyfill");

class Utils {
  static getRandomIntBetween(min, max) {
    return Math.floor(min + Math.random() * Math.floor(max));
  }

  static async getHostName() {
    try {
      var result = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      var url = new URL(result[0].url);
      return url.hostname;
    } catch (error) {
      console.log(error);
    }
  }

  static getDeviceName() {
    const isFirefox = typeof InstallTrigger !== "undefined";
    const browserName = isFirefox ? "Firefox" : "Chrome";
    return `${browserName} (${navigator.platform})`;
  }

  static getExtensionURL() {
    const isFirefox = typeof InstallTrigger !== "undefined",
    isChrome =
      !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime),
    firefoxExtensionUrl =
      "https://addons.mozilla.org/en-GB/firefox/addon/simplelogin/",
    chromeExtensionUrl =
      "https://chrome.google.com/webstore/detail/simplelogin-your-anti-spa/dphilobhebphkdjbpfohgikllaljmgbn";
    return isFirefox ? firefoxExtensionUrl : chromeExtensionUrl;
  }
}

export default Utils;
