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

const useFetch = createFetch({
  options: {
    immediate: false,
    async beforeFetch(ctx) {
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
      const router = useRouter()
      const toaster = useToast()
      const {
        error: { _onError: errHandlerMethod }
      } = ctx

      if (errHandlerMethod !== API_ON_ERR.IGNORE) {
        console.error(ctx.response)
      }

      if (ctx.response?.status === 401) {
        const toast = useToast()
        toast.error({ message: 'Authentication error, please login again' })
        await SLStorage.removeItem(SLStorage.SETTINGS.API_KEY)
        EventManager.broadcast(EventManager.EVENT.SETTINGS_CHANGED)
        router.push('/login')

        return ctx
      }

      if (errHandlerMethod === API_ON_ERR.TOAST) {
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

      if (errHandlerMethod === API_ON_ERR.THROW) {
        throw ctx
      }
      return ctx
    }
  },
  combination: 'chain'
})

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
  useFetch<GetUserInfoReturn>('/api/user_info', options, {
    onFetchError(ctx) {
      ctx.error._onError = toValue(onError)
      return ctx
    },
    ...useFetchOptions
  }).get()

export const useGetLogout = ({
  options = {},
  useFetchOptions,
  onError = API_ON_ERR.TOAST
}: {
  options?: RequestInit
  useFetchOptions?: UseFetchOptions
  onError?: MaybeRefOrGetter<API_ON_ERR>
} = {}) =>
  useFetch('/api/logout', options, {
    immediate: false,
    onFetchError(ctx) {
      ctx.error._onError = toValue(onError)
      return ctx
    },
    ...useFetchOptions
  }).get()

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
}) =>
  useFetch<LoginReturn>('/api/auth/login', options, {
    onFetchError(ctx) {
      ctx.error._onError = toValue(onError)
      return ctx
    },
    immediate: false,
    ...useFetchOptions
  }).post(data)

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
}) =>
  useFetch<MFAReturn>('/api/auth/mfa', options, {
    onFetchError(ctx) {
      ctx.error._onError = toValue(onError)
      return ctx
    },
    immediate: false,
    ...useFetchOptions
  }).post(data)

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
  useFetch<UseGetAliasOptionsReturn>(
    computed(() => `/api/v4/alias/options?hostname=${toValue(hostname)}`),
    options,
    {
      onFetchError(ctx) {
        ctx.error._onError = toValue(onError)
        return ctx
      },
      ...useFetchOptions
    }
  ).get()

export type UseGetAliasReturn = Mailbox[]

export const useGetMailboxes = ({
  options = {},
  useFetchOptions,
  onError = API_ON_ERR.TOAST
}: {
  options?: RequestInit
  useFetchOptions?: UseFetchOptions
  onError?: MaybeRefOrGetter<API_ON_ERR>
} = {}) =>
  useFetch<UseGetAliasReturn>('/api/mailboxes', options, {
    onFetchError(ctx) {
      ctx.error._onError = toValue(onError)
      return ctx
    },
    ...useFetchOptions
  }).get()

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
  useFetch<UsePostGetAliasesReturn>(
    computed(() => `/api/v2/aliases?page_id=${toValue(pageId)}`),
    options,
    {
      onFetchError(ctx) {
        ctx.error._onError = toValue(onError)
        return ctx
      },
      ...useFetchOptions
    }
  ).post(data)

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
  useFetch<UsePostNewAliasReturn>(
    computed(() => `/api/v2/alias/custom/new?hostname=${toValue(hostname)}`),
    options,
    {
      immediate: false,
      onFetchError(ctx) {
        ctx.error._onError = toValue(onError)
        return ctx
      },
      ...useFetchOptions
    }
  ).post(data)

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
  useFetch<UsePostNewRandomAliasReturn>(
    computed(() => newRandomAliasRoute(toValue(hostname))),
    options,
    {
      immediate: false,
      onFetchError(ctx) {
        ctx.error._onError = toValue(onError)
        return ctx
      },
      ...useFetchOptions
    }
  ).post(data)

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
  useFetch<UsePostToggleAliasReturn>(
    computed(() => `/api/aliases/${toValue(aliasId)}/toggle`),
    options,
    {
      immediate: false,
      onFetchError(ctx) {
        ctx.error._onError = toValue(onError)
        return ctx
      },
      ...useFetchOptions
    }
  ).post()

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
  useFetch<{
    name: string
  }>(
    computed(() => `/api/aliases/${toValue(aliasId)}`),
    options,
    {
      immediate: false,
      onFetchError(ctx) {
        ctx.error._onError = toValue(onError)
        return ctx
      },
      ...useFetchOptions
    }
  ).put(data)

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
  useFetch(
    computed(() => `/api/aliases/${toValue(aliasId)}`),
    options,
    {
      immediate: false,
      onFetchError(ctx) {
        ctx.error._onError = toValue(onError)
        return ctx
      },
      ...useFetchOptions
    }
  ).delete()

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
  useFetch<CreateReverseAliasReturn>(
    computed(() => `/api/aliases/${toValue(aliasId)}/contacts`),
    options,
    {
      immediate: false,
      onFetchError(ctx) {
        ctx.error._onError = toValue(onError)
        return ctx
      },
      ...useFetchOptions
    }
  ).post(data)

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
  useFetch<GetApiKeyFromCookieReturn>(apiKeyRoute, options, {
    onFetchError(ctx) {
      ctx.error._onError = toValue(onError)
      return ctx
    },
    immediate: false,
    ...useFetchOptions
  }).post(data)
