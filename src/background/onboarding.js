import browser from "webextension-polyfill";
import SLStorage from "../popup/SLStorage";

function initService() {
  browser.runtime.onInstalled.addListener(async function ({ reason }) {
    if (reason === "install") {
      await SLStorage.clear();

      await browser.tabs.create({
        url: browser.runtime.getURL("/onboarding/index.html"),
      });
    }
  });

  // listen for post-setup screen
  browser.cookies.onChanged.addListener(async function (removed, cookie) {
    if (!removed && cookie.name === "setup_done") {
      const currentTab = await browser.tabs.getCurrent();

      await browser.tabs.update(currentTab.id, {
        url: browser.runtime.getURL("/onboarding/index.html#step3"),
      });
    }
  });
}

export default { initService };
