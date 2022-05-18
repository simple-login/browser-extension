import browser from "webextension-polyfill";
import APIService, { API_ROUTE } from "../popup/APIService";
import SLStorage from "../popup/SLStorage";
import Onboarding from "./onboarding";
import "./content-script";

import { handleNewRandomAlias } from "./create-alias";
import {
  handleOnClickContextMenu,
  generateAliasHandlerJS,
} from "./context-menu";
import axios from "axios";
import Utils from "../popup/Utils";

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

async function handleExtensionSetup() {
  const apiUrl = await SLStorage.get(SLStorage.SETTINGS.API_URL);
  try {
    const url = apiUrl + API_ROUTE.GET_API_KEY_FROM_COOKIE.path;
    const res = await axios.post(url, {
      device: Utils.getDeviceName(),
    });

    const apiKey = res.data.api_key;
    if (apiKey) {
      await SLStorage.set(SLStorage.SETTINGS.API_KEY, apiKey);

      const currentTab = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      const url = `${apiUrl}/onboarding/final`;
      await browser.tabs.update(currentTab[0].id, {
        url,
      });
    } else {
      console.error("Received null API Key");
    }
  } catch (e) {
    // Probably the user is not logged in
    console.error(e);
  }
}

/**
 * Check if a message comes from an authorized source
 * @param {string} url
 * @returns boolean
 */
const isMessageAllowed = (url) => {
  console.log("Received message from " + url);
  const requestUrl = new URL(url);
  const apiUrl = new URL(SLStorage.DEFAULT_SETTINGS[SLStorage.SETTINGS.API_URL]);

  let allowedSources = [
    new RegExp(apiUrl.hostname),
    new RegExp("^app\\.simplelogin\\.io$"),
    new RegExp("^.*\\.protonmail\\.ch$"),
    new RegExp("^.*\\.protonmail\\.com$"),
  ];

  const extraAllowedDomains = SLStorage.DEFAULT_SETTINGS[SLStorage.SETTINGS.EXTRA_ALLOWED_DOMAINS];
  for (const extra of extraAllowedDomains) {
    allowedSources.push(new RegExp(extra));
  }

  for (const source of allowedSources) {
    if (source.test(requestUrl.host)) return true;
  }
  return false;
};

/**
 * Register onMessage listener
 */
browser.runtime.onMessage.addListener(async function (request, sender) {
  // Check messages allowed from everywhere
  if (request.tag === "NEW_RANDOM_ALIAS") {
    return await handleNewRandomAlias(request.currentUrl);
  } else if (request.tag === "GET_APP_SETTINGS") {
    return await handleGetAppSettings();
  }

  // Check messages allowed only from authorized sources
  if (!isMessageAllowed(sender.url)) return;

  if (request.tag === "EXTENSION_SETUP") {
    return await handleExtensionSetup();
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
