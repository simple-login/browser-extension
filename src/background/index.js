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
import Utils from "../popup/Utils";

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

  const url = apiUrl + API_ROUTE.GET_API_KEY_FROM_COOKIE.path;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Sl-Allowcookies": true,
    },
    body: JSON.stringify({
      device: Utils.getDeviceName(),
    }),
  });

  if (res.ok) {
    const apiRes = await res.json();
    const apiKey = apiRes.api_key;
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
  } else {
    console.error("api error");
  }
}

/**
 * Check if a message comes from an authorized source
 * @param {string} url
 * @returns boolean
 */
const isMessageAllowed = (url) => {
  const requestUrl = new URL(url);
  const apiUrl = new URL(
    SLStorage.DEFAULT_SETTINGS[SLStorage.SETTINGS.API_URL]
  );

  let allowedSources = [
    new RegExp(apiUrl.hostname),
    new RegExp("^app\\.simplelogin\\.io$"),
    new RegExp("^.*\\.protonmail\\.ch$"),
    new RegExp("^.*\\.protonmail\\.com$"),
  ];

  const extraAllowedDomains =
    SLStorage.DEFAULT_SETTINGS[SLStorage.SETTINGS.EXTRA_ALLOWED_DOMAINS];
  for (const extra of extraAllowedDomains) {
    allowedSources.push(new RegExp(extra));
  }

  for (const source of allowedSources) {
    if (source.test(requestUrl.host)) return true;
  }
  return false;
};

/**
 * Handle the event of a page querying if the SL extension is installed
 * @return {{data: {version: string}, tag: string}}
 */
const handleExtensionInstalledQuery = () => {
  const manifest = browser.runtime.getManifest();
  return {
    tag: "EXTENSION_INSTALLED_RESPONSE",
    data: {
      version: manifest.version,
    },
  };
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
  } else if (request.tag === "EXTENSION_INSTALLED_QUERY") {
    return handleExtensionInstalledQuery();
  }
});

/**
 * Register context menu
 */
browser.contextMenus.create({
  id: "sl-random",
  title: "Create random email alias (copied)",
  contexts: ["all"],
});

browser.contextMenus.onClicked.addListener(handleOnClickContextMenu);

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
