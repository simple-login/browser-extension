import browser from "webextension-polyfill";
import SLStorage from "../popup/SLStorage";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

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
  browser.cookies.onChanged.addListener(async function (info) {
    const { removed, cookie } = info;
    if (!removed && cookie.name === "setup_done") {
      const currentTab = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      await delay(100);

      await browser.tabs.update(currentTab[0].id, {
        url: browser.runtime.getURL("/onboarding/index.html#step3"),
      });
    }
  });
}

export default { initService };
