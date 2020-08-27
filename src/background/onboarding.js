import browser from "webextension-polyfill";
import SLStorage from "../popup/SLStorage";

let POST_SETUP_URL = null;

function initService() {
  browser.runtime.onInstalled.addListener(async function () {
    const hasFirstRun = await SLStorage.get(SLStorage.SETTINGS.HAS_FIRST_RUN);
    if (hasFirstRun) return;

    browser.tabs.create({
      url: `chrome-extension://${browser.runtime.id}/onboarding/index.html`,
    });

    SLStorage.set(SLStorage.SETTINGS.HAS_FIRST_RUN, true);
  });

  listenPostSetup();
}

async function listenPostSetup() {
  POST_SETUP_URL = `${await SLStorage.get(
    SLStorage.SETTINGS.API_URL
  )}/dashboard/setup_done`;

  browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (tab.url && POST_SETUP_URL && tab.url.startsWith(POST_SETUP_URL)) {
      browser.tabs.update(tab.id, {
        url: `chrome-extension://${browser.runtime.id}/onboarding/index.html#step3`,
      });
    }
  });
}

export default { initService };
