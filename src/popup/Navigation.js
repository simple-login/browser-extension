import EventManager from "./EventManager";

var router = null;

const PATH = {
  ROOT: "/",
  MAIN: "/main",
  NEW_ALIAS_RESULT: "/new-alias-result/:email",
  LOGIN: "/login",
  API_KEY_SETTING: "/api-key-setting",
  SELF_HOST_SETTING: "/self-host-setting",
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

  static navigateTo(path, canGoBack) {
    if (canGoBack) {
      router.push(path);
    } else {
      router.replace(path);
    }

    setTimeout(() => EventManager.broadcast(
      EventManager.EVENT.ROUTE_CHANGED
    ), 10);
  }
}

export default Navigation;
