import EventManager from "./EventManager";
import Navigation from "./Navigation";
import SLStorage from "./SLStorage";
import Utils from "./Utils";
import axios from "axios";

const API_ROUTE = {
  GET_USER_INFO: { method: "GET", path: "/api/user_info" },
  LOGOUT: { method: "GET", path: "/api/logout" },
  LOGIN: { method: "POST", path: "/api/auth/login" },
  MFA: { method: "POST", path: "/api/auth/mfa" },
  GET_ALIAS_OPTIONS: {
    method: "GET",
    path: "/api/v4/alias/options?hostname=:hostname",
  },
  GET_MAILBOXES: {
    method: "GET",
    path: "/api/mailboxes",
  },
  GET_ALIASES: { method: "POST", path: "/api/v2/aliases?page_id=:page_id" },
  NEW_ALIAS: {
    method: "POST",
    path: "/api/v2/alias/custom/new?hostname=:hostname",
  },
  NEW_RANDOM_ALIAS: {
    method: "POST",
    path: "/api/alias/random/new?hostname=:hostname",
  },
  TOGGLE_ALIAS: { method: "POST", path: "/api/aliases/:alias_id/toggle" },
  EDIT_ALIAS: { method: "PUT", path: "/api/aliases/:alias_id" },
  DELETE_ALIAS: { method: "DELETE", path: "/api/aliases/:alias_id" },
  CREATE_REVERSE_ALIAS: {
    method: "POST",
    path: "/api/aliases/:alias_id/contacts",
  },
  GET_API_KEY_FROM_COOKIE: { method: "POST", path: "/api/api_key" },
};

const API_ON_ERR = {
  IGNORE: 1,
  TOAST: 2,
  THROW: 3,
};

const SETTINGS = {
  apiKey: "",
  apiUrl: "",
};

const initService = async () => {
  await reloadSettings();

  EventManager.addListener(EventManager.EVENT.SETTINGS_CHANGED, reloadSettings);
};

const reloadSettings = async () => {
  SETTINGS.apiKey = await SLStorage.get(SLStorage.SETTINGS.API_KEY);
  SETTINGS.apiUrl = await SLStorage.get(SLStorage.SETTINGS.API_URL);
};

const callAPI = async function (
  route,
  params = {},
  data = {},
  errHandlerMethod = API_ON_ERR.THROW
) {
  const { method, path } = route;
  const url = SETTINGS.apiUrl + bindQueryParams(path, params);
  const headers = {};

  if (SETTINGS.apiKey) {
    headers["Authentication"] = SETTINGS.apiKey;
  }

  try {
    const res = await axios({
      method,
      url,
      headers,
      data,
    });

    return res;
  } catch (err) {
    if (errHandlerMethod !== API_ON_ERR.IGNORE) {
      console.error(err);
    }

    if (err.response.status === 401 && !global.isBackgroundJS) {
      await handle401Error();
      return null;
    }

    if (errHandlerMethod === API_ON_ERR.TOAST) {
      if (err.response.data && err.response.data.error) {
        Utils.showError(err.response.data.error);
      } else {
        Utils.showError("Unknown error");
      }
      return null;
    }

    if (errHandlerMethod === API_ON_ERR.THROW) {
      throw err;
    }
  }
};

async function handle401Error() {
  Utils.showError("Authentication error, please login again");
  await SLStorage.remove(SLStorage.SETTINGS.API_KEY);
  EventManager.broadcast(EventManager.EVENT.SETTINGS_CHANGED);
  Navigation.clearHistoryAndNavigateTo(Navigation.PATH.LOGIN);
}

function bindQueryParams(url, params) {
  for (const key of Object.keys(params)) {
    url = url.replace(`:${key}`, encodeURIComponent(params[key]));
  }

  return url;
}

export { callAPI, API_ROUTE, API_ON_ERR, reloadSettings };
export default { initService };
