import { createRouter, createMemoryHistory } from 'vue-router'
import SplashScreen from '../components/SplashScreen.vue'
import LoginPage from '../components/LoginPage.vue'
import ApiKeySetting from '../components/ApiKeySetting.vue'
import SelfHostSetting from '../components/SelfHostSetting.vue'
import MainPage from '../components/MainPage.vue'
import NewAliasResult from '../components/NewAliasResult.vue'
import ReverseAlias from '../components/ReverseAlias.vue'
import AppSettings from '../components/AppSettings.vue'

export default createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/',
      component: SplashScreen
    },
    {
      path: '/login',
      component: LoginPage
    },
    {
      path: '/api-key-setting',
      component: ApiKeySetting
    },
    {
      path: '/self-host-setting',
      component: SelfHostSetting
    },
    {
      path: '/main',
      component: MainPage
    },
    {
      path: '/new-alias-result',
      component: NewAliasResult
    },
    {
      path: '/reverse-alias',
      component: ReverseAlias
    },
    {
      path: '/app-settings',
      component: AppSettings
    }
  ]
})
