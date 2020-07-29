import EventManager from "./EventManager";

let router = null;

const PATH = {
  ROOT: "/",
  MAIN: "/main",
  NEW_ALIAS_RESULT: "/new-alias-result/",
  LOGIN: "/login",
  API_KEY_SETTING: "/api-key-setting",
  SELF_HOST_SETTING: "/self-host-setting",
  APP_SETTINGS: "/app-settings",
};

class Navigation {
  static PATH = PATH;

  static getRoutes(components) {
    return [
      {
        path: Navigation.PATH.ROOT,
        component: components.SplashScreen,
      },
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
      {
        path: Navigation.PATH.APP_SETTINGS,
        component: components.AppSettings,
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
  }

  static canGoBack() {
    return router.history.index > 0;
  }

  static navigateBack() {
    router.go(-1);
  }

  static clearHistory() {
    router.history.index = -1;
  }
}

export default Navigation;
