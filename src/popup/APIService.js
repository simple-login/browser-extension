import EventManager from "./EventManager";
import SLStorage from './SLStorage';
import Utils from './Utils';
import axios from 'axios';

const SETTINGS = {
  apiKey: '',
  apiUrl: '',
};

const fetchSettings = async () => {
  SETTINGS.apiKey = await SLStorage.get(SLStorage.SETTINGS.API_KEY);
  SETTINGS.apiUrl = await SLStorage.get(SLStorage.SETTINGS.API_URL);

  EventManager.addListener(EventManager.EVENT.SETTINGS_CHANGED, async () => {
    SETTINGS.apiKey = await SLStorage.get(SLStorage.SETTINGS.API_KEY);
    SETTINGS.apiUrl = await SLStorage.get(SLStorage.SETTINGS.API_URL);
  });
};

fetchSettings();

class APIService {
  static ROUTE = {
    GET_USER_INFO: { method: "GET", path: "/api/user_info" },
    LOGOUT: { method: "GET", path: "/api/logout" },
    LOGIN: { method: "POST", path: "/api/auth/login" },
    MFA: { method: "POST", path: "/api/auth/mfa" },
    GET_ALIAS_OPTIONS: {
      method: "GET",
      path: "/api/v4/alias/options?hostname=:hostname",
    },
    GET_ALIASES: { method: "GET", path: "/api/aliases?page_id=:page_id" },
    NEW_ALIAS: {
      method: "POST",
      path: "/api/v2/alias/custom/new?hostname=:hostname",
    },
    NEW_RANDOM_ALIAS: {
      method: "POST",
      path: "/api/alias/random/new?hostname=:hostname",
    },
    TOGGLE_ALIAS: { method: "POST", path: "/api/aliases/:alias_id/toggle" },
    DELETE_ALIAS: { method: "DELETE", path: "/api/aliases/:alias_id" },
    GET_API_KEY_FROM_COOKIE: { method: "POST", path: "/api/api_key" },
  };

  static async call(route, dataAndParams, contextForToast) {
    const { method, path } = route;
    const data = JSON.parse(JSON.stringify(dataAndParams));
    const url = SETTINGS.apiUrl + bindQueryParams(path, data);
    const headers = {};

    if (SETTINGS.apiKey) {
      headers['Authentication'] = SETTINGS.apiKey;
    }

    try {
      const res = await axios({
        method,
        url,
        headers,
      });

      return res;
    } catch (err) {
      console.error(err);
      if (context) {
        Utils.showError(contextForToast, 'Unknown error');
      } else {
        throw err;
      }
    }
  }
}

function bindQueryParams(url, params) {
  for (const key of Object.keys(params)) {
    if (url.indexOf(`:${key}`) !== -1) {
      url = url.replace(`:${key}`, encodeURIComponent(params[key]));
      delete params[key];
    }
  }

  return url;
}

export default APIService;
