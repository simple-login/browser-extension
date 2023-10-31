import {createMemoryHistory, createRouter} from 'vue-router'
import SplashScreen from '../components/SplashScreen.vue'
import LoginPage from '../components/LoginPage.vue'
import SelfHostSetting from '../components/SelfHostSetting.vue'
import ApiKeySetting from '../components/ApiKeySetting.vue'
import MainPage from '../components/MainPage.vue'
import NewAliasResult from '../components/NewAliasResult.vue'
import ReverseAlias from '../components/ReverseAlias.vue'
import AppSettings from '../components/AppSettings.vue'

// const PATH = {
//   ROOT: "/",
//   MAIN: "/main",
//   NEW_ALIAS_RESULT: "/new-alias-result/",
//   LOGIN: "/login",
//   API_KEY_SETTING: "/api-key-setting",
//   SELF_HOST_SETTING: "/self-host-setting",
//   REVERSE_ALIAS: "/reverse-alias",
//   APP_SETTINGS: "/app-settings",
// } as const;

export default createRouter({
  history: createMemoryHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: SplashScreen,
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginPage,
    },
    {
      path: '/api-key-setting',
      name: 'ApiKeySetting',
      component: ApiKeySetting,
    },
    {
      path: '/self-host-setting',
      name: 'SelfHostSetting',
      component: SelfHostSetting,
    },
    {
      path: '/main',
      name: 'Main',
      component: MainPage,
    },
    {
      path: '/new-alias-result',
      name: 'NewAliasResult',
      component: NewAliasResult,
    },
    {
      path: '/reverse-alias',
      name: 'ReverseAlias',
      component: ReverseAlias,
    },
    {
      path: '/app-settings',
      name: 'AppSettings',
      component: AppSettings,
    },
  ],
})
