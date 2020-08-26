import browser from "webextension-polyfill";
import { havePermission, addPermissionListener } from "./permissions";

let hasAlreadySetup = false;

async function setupContentScript() {
  if (await havePermission("tabs")) {
    if (hasAlreadySetup) return;
    hasAlreadySetup = true;

    browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
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
