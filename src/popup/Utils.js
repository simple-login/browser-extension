const browser = require("webextension-polyfill");

class Utils {
  static getRandomIntBetween(min, max) {
    return Math.floor(min + Math.random() * Math.floor(max));
  }

  static async getHostName() {
    try {
      const result = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });
      const url = new URL(result[0].url);
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
      firefoxExtensionUrl =
        "https://addons.mozilla.org/en-GB/firefox/addon/simplelogin/",
      chromeExtensionUrl =
        "https://chrome.google.com/webstore/detail/simplelogin-your-anti-spa/dphilobhebphkdjbpfohgikllaljmgbn";
    return isFirefox ? firefoxExtensionUrl : chromeExtensionUrl;
  }

  static showSuccess(context, message) {
    if (context.$toasted) {
      context.$toasted.show(message, {
        type: "success",
        duration: 2500,
      });
    }
  }

  static showError(context, message) {
    if (context.$toasted) {
      context.$toasted.show(message, {
        type: "error",
        duration: 3000,
        action: {
          text: "×",
          onClick: (e, toastObject) => {
            toastObject.goAway(0);
          },
        },
      });
    }
  }
}

export default Utils;
