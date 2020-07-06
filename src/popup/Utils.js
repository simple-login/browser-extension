class Utils {
  static getRandomIntBetween(min, max) {
    return Math.floor(min + Math.random() * Math.floor(max));
  }

  static async getHostName() {
    try {
      var result = await this.$browser.tabs.query({
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
}

export default Utils;
