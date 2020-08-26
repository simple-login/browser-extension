import browser from "webextension-polyfill";
import { havePermission } from "./permissions";

async function init() {
  if (await havePermission('tabs')) {
    browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
      browser.tabs.executeScript(tabId, {
        file: 'content_script/input_tools.js',
        runAt: 'document_idle',
      });
    
      browser.tabs.insertCSS(tabId, {
        file: 'content_script/input_tools.css',
      });
    });
  }
}

init();
