import { callAPI, API_ROUTE, API_ON_ERR } from "./popup/APIService";
import APIService from "./popup/APIService";
import SLStorage from "./popup/SLStorage";
import Utils from "./popup/Utils";

global.browser = require("webextension-polyfill");

const onMessageHandler = async function (request, sender) {
  if (request.tag === "NEW_RANDOM_ALIAS") {
    const hostname = await Utils.getHostName(sender.tab);
    try {
      const res = await callAPI(
        API_ROUTE.NEW_RANDOM_ALIAS,
        {
          hostname,
        },
        {
          note: `Used on ${hostname}`,
        }
      );

      return res.data;
    } catch (err) {
      // rate limit reached
      if (err.response.status === 429) {
        return {
          error:
            "Rate limit exceeded - please wait 60s before creating new alias",
        };
      } else if (err.response.data.error) {
        return {
          error: err.response.data.error,
        };
      } else {
        return {
          error: "Unknown error",
        };
      }
    }
  } else if (request.tag === "GET_APP_SETTINGS") {
    return {
      showSLButton:
        (await SLStorage.get(SLStorage.SETTINGS.API_KEY)) !== "" &&
        (await SLStorage.get(SLStorage.SETTINGS.SHOW_SL_BUTTON)),
      SLButtonPosition: await SLStorage.get(
        SLStorage.SETTINGS.SL_BUTTON_POSITION
      ),
    };
  }
};

global.browser.runtime.onMessage.addListener(onMessageHandler);

APIService.initService();
