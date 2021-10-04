let router = null;

const PATH = {
  ROOT: "/",
  MAIN: "/main",
  NEW_ALIAS_RESULT: "/new-alias-result/",
  LOGIN: "/login",
  API_KEY_SETTING: "/api-key-setting",
  SELF_HOST_SETTING: "/self-host-setting",
  REVERSE_ALIAS: "/reverse-alias",
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
        path: Navigation.PATH.REVERSE_ALIAS,
        component: components.ReverseAlias,
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

  static clearHistoryAndNavigateTo(path) {
    router.history.stack = [];
    router.history.index = -1;
    setTimeout(() => router.push(path), 10);
  }
}

export default Navigation;
