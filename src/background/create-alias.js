import {
  callAPI,
  API_ROUTE,
  API_ON_ERR,
  reloadSettings,
} from "../popup/APIService";
import Utils from "../popup/Utils";

/**
 * Create random alias
 * @param {*} tab
 */
async function handleNewRandomAlias(tab) {
  await reloadSettings();
  const hostname = await Utils.getHostName(tab);
  try {
    const res = await callAPI(
      API_ROUTE.NEW_RANDOM_ALIAS,
      {
        hostname,
      },
      {
        note: `Used on ${hostname}`,
      },
      API_ON_ERR.THROW
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
}

export { handleNewRandomAlias };
