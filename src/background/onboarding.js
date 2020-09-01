import browser from "webextension-polyfill";
import SLStorage from "../popup/SLStorage";

async function initService() {
  browser.runtime.onInstalled.addListener(async function ({ reason }) {
    if (reason === "install") {
      await SLStorage.clear();

      await browser.tabs.create({
        url: browser.runtime.getURL("/onboarding/index.html"),
      });
    }
  });

  await listenPostSetup();
}

async function listenPostSetup() {
  const POST_SETUP_URL = `${await SLStorage.get(
    SLStorage.SETTINGS.API_URL
  )}/dashboard/setup_done`;

  browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab.url && POST_SETUP_URL && tab.url.startsWith(POST_SETUP_URL)) {
      browser.tabs.update(tab.id, {
        url: browser.runtime.getURL("/onboarding/index.html#step3"),
      });
    }
  });
}

export default { initService };
