import browser from "webextension-polyfill";
import SLStorage from "../popup/SLStorage";

function initService() {
  browser.runtime.onInstalled.addListener(async function ({ reason }) {
    if (reason === "install") {
      await SLStorage.clear();

      const apiUrl = await SLStorage.get(SLStorage.SETTINGS.API_URL);
      await browser.tabs.create({
        url: `${apiUrl}/onboarding`,
      });
    }
  });
}

export default { initService };
