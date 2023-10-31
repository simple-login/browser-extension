import {useRouterExtensions} from '../composables'
import type {
  LoginResponse,
  LoginData,
  AliasOptions,
  GetAliasesResponse,
  CreateReverseAliasResponse,
} from '../types'
import EventManager from './eventManager'
import SLStorage from './slStorage'
import {showError} from './commonUtils'
import Axios, {type AxiosRequestConfig} from 'axios'

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  errHandlerMethod?: API_ON_ERR
}

const axios = Axios.create()

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isApiOnError = (value: any): value is API_ON_ERR => value in API_ON_ERR
    const errHandlerMethodValue = error.config?.errHandlerMethod // 'Potentionally' API_ON_ERROR | undefined
    const errHandlerMethod = isApiOnError(errHandlerMethodValue)
      ? errHandlerMethodValue
      : API_ON_ERR.THROW

    if (errHandlerMethod === API_ON_ERR.IGNORE) {
      return Promise.resolve(null)
    }

    console.error(error)

    if (error.response.status === 401 && !window.isBackgroundJS) {
      showError('Authentication error, please login again')
      await SLStorage.remove(SLStorage.settings.apiKey)
      EventManager.broadcast(EventManager.settingsChangedEvent)
      const routerExtensions = useRouterExtensions()
      routerExtensions.clearHistoryAndNavigateTo('/login')
      return Promise.resolve(null)
    }

    if (errHandlerMethod === API_ON_ERR.TOAST) {
      if (error.response.data && error.response.data.error) {
        showError(error.response.data.error)
      } else {
        showError('Unknown error')
      }
      return Promise.resolve(null)
    }

    if (errHandlerMethod === API_ON_ERR.THROW) {
      return Promise.reject(error)
    }

    return Promise.resolve(null)
  }
)

const getDefaultConfig = (): CustomAxiosRequestConfig => ({
  headers: {
    ...(SETTINGS.apiKey ? {Authentication: SETTINGS.apiKey} : {}),
  },
})

const getUserInfo = (config?: CustomAxiosRequestConfig) => {
  return axios.get<{name: string; email: string; in_trial: boolean; is_premium: boolean}>(
    '/api/user_info',
    {
      ...getDefaultConfig(),
      ...config,
    } as CustomAxiosRequestConfig
  )
}

const logout = (config?: CustomAxiosRequestConfig) => {
  return axios.get('/api/logout', {
    ...getDefaultConfig(),
    ...config,
  } as CustomAxiosRequestConfig)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const login = (
  data: {
    email: string
    password: string
    device: string
  },
  config?: CustomAxiosRequestConfig
) => {
  return axios.post<LoginResponse>('/api/auth/login', data, {
    ...getDefaultConfig(),
    ...config,
  } as CustomAxiosRequestConfig)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mfa = (data: any, config?: CustomAxiosRequestConfig) => {
  return axios.post<LoginData>('/api/auth/mfa', data, {
    ...getDefaultConfig(),
    ...config,
  } as CustomAxiosRequestConfig)
}

const getAliasOptions = (hostname: string, config?: CustomAxiosRequestConfig) => {
  return axios.get<AliasOptions>(`/api/v4/alias/options?hostname=${hostname}`, {
    ...getDefaultConfig(),
    ...config,
  } as CustomAxiosRequestConfig)
}

const getMailboxes = (config?: CustomAxiosRequestConfig) => {
  return axios.get('/api/mailboxes', {
    ...getDefaultConfig(),
    ...config,
  } as CustomAxiosRequestConfig)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAliases = (pageId: string, data: any, config?: CustomAxiosRequestConfig) => {
  return axios.post<GetAliasesResponse>(`/api/v2/aliases?page_id=${pageId}`, data, {
    ...getDefaultConfig(),
    ...config,
  } as CustomAxiosRequestConfig)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const newAlias = (
  hostname: string,
  data: {
    alias_prefix: string
    signed_suffix: string
    note: string
  },
  config?: CustomAxiosRequestConfig
) => {
  return axios.post(`/api/v2/alias/custom/new?hostname=${hostname}`, data, {
    ...getDefaultConfig(),
    ...config,
  } as CustomAxiosRequestConfig)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const newRandomAlias = (
  hostname: string,
  data: {note: string},
  config?: CustomAxiosRequestConfig
) => {
  return axios.post(`/api/alias/random/new?hostname=${hostname}`, data, {
    ...getDefaultConfig(),
    ...config,
  } as CustomAxiosRequestConfig)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toggleAlias = (aliasId: string, config?: CustomAxiosRequestConfig) => {
  return axios.post<{enabled: boolean}>(`/api/aliases/${aliasId}/toggle`, {}, {
    ...getDefaultConfig(),
    ...config,
  } as CustomAxiosRequestConfig)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const editAlias = (aliasId: string, data: any, config?: CustomAxiosRequestConfig) => {
  return axios.put(`/api/aliases/${aliasId}`, data, {
    ...getDefaultConfig(),
    ...config,
  } as CustomAxiosRequestConfig)
}

const deleteAlias = (aliasId: string, config?: CustomAxiosRequestConfig) => {
  return axios.delete(`/api/aliases/${aliasId}`, {
    ...getDefaultConfig(),
    ...config,
  } as CustomAxiosRequestConfig)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createReverseAlias = (
  aliasId: string,
  data: {contact: string},
  config?: CustomAxiosRequestConfig
) => {
  return axios.post<CreateReverseAliasResponse>(`/api/aliases/${aliasId}/contacts`, data, {
    ...getDefaultConfig(),
    ...config,
  } as CustomAxiosRequestConfig)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getApiKeyFromCookie = (
  data: {
    device: string
  },
  config?: CustomAxiosRequestConfig
) => {
  return axios.post<{api_key?: string}>('/api/api_key', data, {
    ...getDefaultConfig(),
    ...config,
  } as CustomAxiosRequestConfig)
}

enum API_ON_ERR {
  IGNORE = 1,
  TOAST = 2,
  THROW = 3,
}

const SETTINGS = {
  apiKey: '',
  apiUrl: '',
}

const initService = async () => {
  await reloadSettings()

  EventManager.addListener(EventManager.settingsChangedEvent, reloadSettings)
}

const reloadSettings = async () => {
  SETTINGS.apiKey = await SLStorage.get(SLStorage.settings.apiKey)
  SETTINGS.apiUrl = await SLStorage.get(SLStorage.settings.apiUrl)
}

export {
  API_ON_ERR,
  initService,
  reloadSettings,
  getUserInfo,
  logout,
  login,
  mfa,
  getAliasOptions,
  getMailboxes,
  getAliases,
  newAlias,
  newRandomAlias,
  toggleAlias,
  editAlias,
  deleteAlias,
  createReverseAlias,
  getApiKeyFromCookie,
}
