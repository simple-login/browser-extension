import browser from "webextension-polyfill";
import APIService from "../popup/APIService";
import SLStorage from "../popup/SLStorage";
import Onboarding from "./onboarding";
import "./content-script";

import { handleNewRandomAlias } from "./create-alias";
import {
  handleOnClickContextMenu,
  generateAliasHandlerJS,
} from "./context-menu";

global.isBackgroundJS = true;

/**
 * Get app settings
 */
async function handleGetAppSettings() {
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
browser.runtime.onMessage.addListener(async function (request, sender) {
  if (request.tag === "NEW_RANDOM_ALIAS") {
    return await handleNewRandomAlias(request.currentUrl);
  } else if (request.tag === "GET_APP_SETTINGS") {
    return await handleGetAppSettings();
  }
});

/**
 * Register context menu
 */
browser.contextMenus.create({
  title: "Create random email alias (copied)",
  contexts: ["all"],
  onclick: handleOnClickContextMenu,
});

/**
 * Shortcuts and hotkeys listener
 */
browser.commands.onCommand.addListener(async (command) => {
  if (command === "generate-random-alias") {
    const currentTab = (
      await browser.tabs.query({ active: true, currentWindow: true })
    )[0];
    const res = await handleNewRandomAlias(currentTab.url);
    generateAliasHandlerJS(currentTab, res);
  }
});

APIService.initService();
Onboarding.initService();
