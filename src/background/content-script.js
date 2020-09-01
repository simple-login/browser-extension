import browser from "webextension-polyfill";
import { havePermission, addPermissionListener } from "./permissions";
import SLStorage from "../popup/SLStorage";

let hasAlreadySetup = false;

async function setupContentScript() {
  if (await havePermission("tabs")) {
    if (hasAlreadySetup) return;
    hasAlreadySetup = true;

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

      browser.tabs.executeScript(tabId, {
        file: "content_script/input_tools.js",
        runAt: "document_idle",
      });

      browser.tabs.insertCSS(tabId, {
        file: "content_script/input_tools.css",
      });
    });
  }
}

addPermissionListener(setupContentScript);
setupContentScript();
