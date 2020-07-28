import APIService from "../popup/APIService";
import SLStorage from "../popup/SLStorage";

import { handleNewRandomAlias } from './create-alias';
import { handleOnClickContextMenu } from "./context-menu";

global.browser = require("webextension-polyfill");

/**
 * Get app settings
 */
async function handerGetAppSettings() {
  return {
    showSLButton:
      (await SLStorage.get(SLStorage.SETTINGS.API_KEY)) !== "" &&
      (await SLStorage.get(SLStorage.SETTINGS.SHOW_SL_BUTTON)),
    SLButtonPosition: await SLStorage.get(
      SLStorage.SETTINGS.SL_BUTTON_POSITION
    ),
  };
}

/**
 * Register onMessage listener
 */
global.browser.runtime.onMessage.addListener(async function (request, sender) {
  if (request.tag === "NEW_RANDOM_ALIAS") {
    return await handleNewRandomAlias(sender.tab);
  } else if (request.tag === "GET_APP_SETTINGS") {
    return await handerGetAppSettings();
  }
});

/**
 * Register context menu
 */
global.browser.contextMenus.create({
  title: 'Create random email alias (copied)',
  contexts: [ 'all' ],
  onclick: handleOnClickContextMenu,
});

APIService.initService();
