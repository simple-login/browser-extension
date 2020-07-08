import EventManager from "./EventManager";

var router = null;

const PATH = {
  ROOT: "/",
  MAIN: "/main",
  NEW_ALIAS_RESULT: "/new-alias-result",
  LOGIN: "/login",
  API_KEY_SETTING: "/api-key-setting",
  SELF_HOST_SETTING: "/self-host-setting",
};

const BACK_TO = {
  [PATH.API_KEY_SETTING]: PATH.LOGIN,
  [PATH.SELF_HOST_SETTING]: PATH.LOGIN,
};

class Navigation {
  static PATH = PATH;

  static getRoutes(components) {
    return [
      {
        path: Navigation.PATH.LOGIN,
        component: components.Login,
      },
      {
        path: Navigation.PATH.API_KEY_SETTING,
        component: components.ApiKeySetting,
      },
      {
        path: Navigation.PATH.SELF_HOST_SETTING,
        component: components.SelfHostSetting,
      },
      {
        path: Navigation.PATH.MAIN,
        component: components.Main,
      },
      {
        path: Navigation.PATH.NEW_ALIAS_RESULT,
        component: components.NewAliasResult,
      },
    ];
  }

  static setRouter($router) {
    router = $router;
  }

  static navigateTo(path) {
    router.push(path);

    EventManager.broadcast(
      EventManager.EVENT.ROUTE_CHANGED,
      Navigation.getPreviousPath(path)
    );
  }

  static getPreviousPath(path) {
    return BACK_TO[path];
  }
}

export default Navigation;
