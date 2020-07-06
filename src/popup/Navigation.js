var router = null;

class Navigation {
  static PATH = {
    ROOT: '/',
    LOGIN: '/login',
    API_KEY_SETTING: '/api-key-setting',
    SELF_HOST_SETTING: '/self-host-setting',
  };

  static getRoutes(components) {
    return [
      { path: Navigation.PATH.ROOT, component: components.SplashScreen },
      { path: Navigation.PATH.LOGIN, component: components.Login },
      { path: Navigation.PATH.API_KEY_SETTING, component: components.ApiKeySetting },
      { path: Navigation.PATH.SELF_HOST_SETTING, component: components.SelfHostSetting },
    ];
  }

  static setRouter($router) {
    router = $router;
  }

  static navigateTo(path) {
    router.push(path);
  }

  static navigateBack() {
    // TODO
  }
}

export default Navigation;