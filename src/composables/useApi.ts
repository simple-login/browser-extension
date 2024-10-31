import { createFetch, type UseFetchOptions } from '@vueuse/core'
import { useToast } from './useToast'
import SLStorage from '../utils/SLStorage'
import EventManager from '../utils/EventManager'
import { useRouter } from 'vue-router'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import type { Alias, Mailbox } from '../types'
import { SETTINGS, apiKeyRoute, newRandomAliasRoute, reloadSettings } from '../utils/api'

export const enum API_ON_ERR {
  IGNORE = 'IGNORE',
  TOAST = 'TOAST',
  THROW = 'THROW'
}

const useFetch = (errHandlerMethod: MaybeRefOrGetter<API_ON_ERR> = API_ON_ERR.IGNORE) => {
  const router = useRouter()
  const toaster = useToast()

  return createFetch({
    options: {
      immediate: false,
      async beforeFetch(ctx) {
        ctx.url = `${SETTINGS.apiUrl}${ctx.url}`
        if (!SETTINGS.apiKey) {
          await reloadSettings()
        }

        ctx.options.headers = {
          ...ctx.options.headers,
          Authentication: SETTINGS.apiKey,
          'Content-Type':
            ctx.options.headers &&
            'Content-Type' in ctx.options.headers &&
            !!ctx.options.headers['Content-Type']
              ? ctx.options.headers['Content-Type']
              : ctx.options.method === 'POST' || ctx.options.method === 'PUT'
                ? 'application/json'
                : ''
        }

        return ctx
      },
      async onFetchError(ctx) {
        if (toValue(errHandlerMethod) === API_ON_ERR.IGNORE) {
          return ctx
        }

        if (ctx.response?.status === 401) {
          const toast = useToast()
          toast.error({ message: 'Authentication error, please login again' })
          await SLStorage.removeItem(SLStorage.SETTINGS.API_KEY)
          EventManager.broadcast(EventManager.EVENT.SETTINGS_CHANGED)
          router.push('/login')

          return ctx
        }

        if (toValue(errHandlerMethod) === API_ON_ERR.TOAST) {
          if (ctx.error.customMessage) {
            toaster.error({ message: ctx.error.customMessage })
            return ctx
          }

          if (ctx.error) {
            toaster.error({ message: ctx.error })
          } else {
            toaster.error({ message: 'Unknown error' })
          }
          return ctx
        }

        if (toValue(errHandlerMethod) === API_ON_ERR.THROW) throw ctx

        return ctx
      }
    },
    combination: 'chain'
  })
}

export type GetUserInfoReturn = {
  name: string
  email: string
  is_premium: boolean
  in_trial: boolean
  can_create_reverse_alias: boolean
}

export const useGetUserInfo = ({
  options = {},
  useFetchOptions,
  onError = API_ON_ERR.TOAST
}: {
  options?: RequestInit
  useFetchOptions?: UseFetchOptions
  onError?: MaybeRefOrGetter<API_ON_ERR>
} = {}) =>
  useFetch(onError)('/api/user_info', options, useFetchOptions).get().json<GetUserInfoReturn>()

export const useGetLogout = ({
  options = {},
  useFetchOptions,
  onError = API_ON_ERR.TOAST
}: {
  options?: RequestInit
  useFetchOptions?: UseFetchOptions
  onError?: MaybeRefOrGetter<API_ON_ERR>
} = {}) => useFetch(onError)('/api/logout', options, useFetchOptions).get().json()

export type LoginReturn = {
  name: string
  email: string
  api_key: string
  mfa_enabled: boolean
  mfa_key?: string
}

export const usePostLogin = ({
  options = {},
  useFetchOptions,
  data,
  onError = API_ON_ERR.TOAST
}: {
  options?: RequestInit
  data: MaybeRefOrGetter<{
    email: string
    password: string
    device: string
  }>
  useFetchOptions?: UseFetchOptions
  onError?: MaybeRefOrGetter<API_ON_ERR>
}) => useFetch(onError)('/api/auth/login', options, useFetchOptions).post(data).json<LoginReturn>()

export type MFAReturn = {
  name: string
  email: string
  api_key: string
}

export const usePostMFA = ({
  options = {},
  useFetchOptions,
  data,
  onError = API_ON_ERR.TOAST
}: {
  options?: RequestInit
  data: MaybeRefOrGetter<{
    mfa_token: string
    mfa_key: string
    device: string
  }>
  useFetchOptions?: UseFetchOptions
  onError?: MaybeRefOrGetter<API_ON_ERR>
}) => useFetch(onError)('/api/auth/mfa', options, useFetchOptions).post(data).json<MFAReturn>()

export type UseGetAliasOptionsReturn = {
  recommendation:
    | undefined
    | {
        alias: string
      }
  suffixes: string[]
  prefix_suggestion: string
  can_create: boolean
}

export const useGetAliasOptions = ({
  hostname,
  options = {},
  useFetchOptions,
  onError = API_ON_ERR.TOAST
}: {
  hostname: MaybeRefOrGetter<string>
  options?: RequestInit
  useFetchOptions?: UseFetchOptions
  onError?: MaybeRefOrGetter<API_ON_ERR>
}) =>
  useFetch(onError)(
    computed(() => `/api/v4/alias/options?hostname=${toValue(hostname)}`),
    options,
    useFetchOptions
  )
    .get()
    .json<UseGetAliasOptionsReturn>()

export type UseGetAliasReturn = { mailboxes: Mailbox[] }

export const useGetMailboxes = ({
  options = {},
  useFetchOptions,
  onError = API_ON_ERR.TOAST
}: {
  options?: RequestInit
  useFetchOptions?: UseFetchOptions
  onError?: MaybeRefOrGetter<API_ON_ERR>
} = {}) =>
  useFetch(onError)('/api/mailboxes', options, useFetchOptions).get().json<UseGetAliasReturn>()

export type UsePostGetAliasesReturn = {
  aliases: Alias[]
}

export const usePostGetAliases = ({
  pageId,
  options = {},
  data,
  useFetchOptions,
  onError = API_ON_ERR.TOAST
}: {
  pageId: MaybeRefOrGetter<number>
  data: MaybeRefOrGetter<{
    query: string
  }> | null
  options?: RequestInit
  useFetchOptions?: UseFetchOptions
  onError?: MaybeRefOrGetter<API_ON_ERR>
}) =>
  useFetch(onError)(
    computed(() => `/api/v2/aliases?page_id=${toValue(pageId)}`),
    options,
    useFetchOptions
  )
    .post(data)
    .json<UsePostGetAliasesReturn>()

export type UsePostNewAliasReturn = {
  error?: unknown
}

export const usePostNewAlias = ({
  hostname,
  options = {},
  data,
  useFetchOptions,
  onError = API_ON_ERR.TOAST
}: {
  hostname: MaybeRefOrGetter<string>
  options?: RequestInit
  data: MaybeRefOrGetter<{
    alias_prefix: string
    signed_suffix: string
    note: string
  }> | null
  useFetchOptions?: UseFetchOptions
  onError?: MaybeRefOrGetter<API_ON_ERR>
}) =>
  useFetch(onError)(
    computed(() => `/api/v2/alias/custom/new?hostname=${toValue(hostname)}`),
    options,
    useFetchOptions
  )
    .post(data)
    .json<UsePostNewAliasReturn>()

export type UsePostNewRandomAliasReturn = {
  error?: unknown
  alias: string
}

export const usePostNewRandomAlias = ({
  hostname,
  options = {},
  data,
  useFetchOptions,
  onError = API_ON_ERR.TOAST
}: {
  hostname: MaybeRefOrGetter<string>
  options?: RequestInit
  data: MaybeRefOrGetter<{
    note: string
  }> | null
  useFetchOptions?: UseFetchOptions
  onError?: MaybeRefOrGetter<API_ON_ERR>
}) =>
  useFetch(onError)(
    computed(() => newRandomAliasRoute(toValue(hostname))),
    options,
    useFetchOptions
  )
    .post(data)
    .json<UsePostNewRandomAliasReturn>()

export type UsePostToggleAliasReturn = {
  enabled: boolean
}

export const usePostToggleAlias = ({
  aliasId,
  options = {},
  useFetchOptions,
  onError = API_ON_ERR.TOAST
}: {
  aliasId: MaybeRefOrGetter<string>
  options?: RequestInit
  useFetchOptions?: UseFetchOptions
  onError?: MaybeRefOrGetter<API_ON_ERR>
}) =>
  useFetch(onError)(
    computed(() => `/api/aliases/${toValue(aliasId)}/toggle`),
    options,
    useFetchOptions
  )
    .post()
    .json<UsePostToggleAliasReturn>()

export const usePutEditAlias = ({
  aliasId,
  options = {},
  useFetchOptions,
  data,
  onError = API_ON_ERR.TOAST
}: {
  aliasId: MaybeRefOrGetter<string>
  options?: RequestInit
  data: MaybeRefOrGetter<{
    note: string
    name: string
    disable_pgp: boolean
    mailbox_ids: string[]
  }>
  useFetchOptions?: UseFetchOptions
  onError?: MaybeRefOrGetter<API_ON_ERR>
}) =>
  useFetch(onError)(
    computed(() => `/api/aliases/${toValue(aliasId)}`),
    options,
    useFetchOptions
  )
    .put(data)
    .json<{
      name: string
    }>()

export const useDeleteAlias = ({
  aliasId,
  options = {},
  useFetchOptions,
  onError = API_ON_ERR.TOAST
}: {
  aliasId: MaybeRefOrGetter<string>
  options?: RequestInit
  useFetchOptions?: UseFetchOptions
  onError?: MaybeRefOrGetter<API_ON_ERR>
}) =>
  useFetch(onError)(
    computed(() => `/api/aliases/${toValue(aliasId)}`),
    options,
    useFetchOptions
  )
    .delete()
    .json()

export type CreateReverseAliasReturn = {
  contact: string
  reverse_alias: string
  existed: boolean
}

export const usePostCreateReverseAlias = ({
  aliasId,
  options = {},
  useFetchOptions,
  data,
  onError = API_ON_ERR.TOAST
}: {
  aliasId: MaybeRefOrGetter<string>
  options?: RequestInit
  useFetchOptions?: UseFetchOptions
  data: MaybeRefOrGetter<{
    contact: string
  }>
  onError?: MaybeRefOrGetter<API_ON_ERR>
}) =>
  useFetch(onError)(
    computed(() => `/api/aliases/${toValue(aliasId)}/contacts`),
    options,
    useFetchOptions
  )
    .post(data)
    .json<CreateReverseAliasReturn>()

export type GetApiKeyFromCookieReturn = {
  api_key: string
}

export const usePostGetApiKeyFromCookie = ({
  options = {
    headers: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'X-Sl-Allowcookies': true as any
    }
  },
  useFetchOptions,
  data,
  onError = API_ON_ERR.TOAST
}: {
  options?: RequestInit
  useFetchOptions?: UseFetchOptions
  data: MaybeRefOrGetter<{
    device: string
  }> | null
  onError?: MaybeRefOrGetter<API_ON_ERR>
}) =>
  useFetch(onError)(apiKeyRoute, options, useFetchOptions)
    .post(data)
    .json<GetApiKeyFromCookieReturn>()
