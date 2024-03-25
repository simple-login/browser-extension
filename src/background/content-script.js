import browser from "webextension-polyfill";
import SLStorage from "../popup/SLStorage";

async function setupContentScript() {
  const apiUrl = SLStorage.get(SLStorage.SETTINGS.API_URL);

  browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (
      tab.url.startsWith("chrome") || // chrome internal pages
      tab.url.startsWith("about") || // firefox internal pages
      tab.url.startsWith("moz") || // firefox internal pages
      tab.url.startsWith(apiUrl) // app domain
    ) {
      return;
    }

    browser.scripting
      .registerContentScripts([
        {
          id: "input-tools",
          js: ["content_script/input_tools.js"],
          css: ["content_script/input_tools.css"],
          persistAcrossSessions: false,
          matches: ["*://*/*"],
          runAt: "document_idle",
        },
      ])
      .then(() => console.log("registration input tools complete"))
      .catch((err) => console.warn("unexpected error", err));
  });
}

setupContentScript();
