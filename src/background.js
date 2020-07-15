import { callAPI, API_ROUTE, API_ON_ERR } from "./popup/APIService";
import APIService from "./popup/APIService";
import SLStorage from "./popup/SLStorage";
import Utils from "./popup/Utils";

global.browser = require("webextension-polyfill");

const onMessageHandler = async function (request, sender) {
  console.log(await Utils.getHostName(sender.tab));
  if (request.tag === "NEW_RANDOM_ALIAS") {
    try {
      const res = await callAPI(
        API_ROUTE.NEW_RANDOM_ALIAS,
        {
          hostname: await Utils.getHostName(sender.tab),
        },
        {}
      );

      return res.data;
    } catch (err) {
      // rate limit reached
      if (err.request.status === 429) {
        return {
          error: "Rate limit exceeded - please wait 60s before creating new alias"
        };
      } else {
        return {
          error: "Unknown error"
        };
      }
    }
  }
};

global.browser.runtime.onMessage.addListener(onMessageHandler);

APIService.initService();