import { ref, watch } from 'vue'
import SLStorage from '../utils/SLStorage'
import type { MustacheViewKeys } from '../types'
import mustache from 'mustache'

const ALIAS_PREFIX_REGEX = /^[0-9a-z-_.]+$/

export const useMainPageSuggestedPrefix = async () => {
  const aliasPrefixMustacheTemplate: string | null =
    (await SLStorage.getItem('ALIAS_PREFIX_MUSTACHE_TEMPLATE')) || null

  const aliasPrefix = ref('')
  const aliasPrefixError = ref('')

  const setAliasPrefixWithMustache = (suggestion: string) => {
    if (!aliasPrefixMustacheTemplate) return suggestion
    return mustache.render(aliasPrefixMustacheTemplate, {
      suggested: () => suggestion,
      random: () => Math.floor(Math.random() * (6 - 2 + 1) + 2).toString()
    } satisfies Record<MustacheViewKeys, unknown>)
  }

  watch(aliasPrefix, () => {
    aliasPrefixError.value = ''
  })

  const validateAliasPrefix = () => {
    if (aliasPrefix.value.match(ALIAS_PREFIX_REGEX) === null) {
      aliasPrefixError.value =
        'Only lowercase letters, dots, numbers, dashes (-) and underscores (_) are currently supported.'
      return false
    }
    return true
  }

  return { aliasPrefix, setAliasPrefixWithMustache, aliasPrefixError, validateAliasPrefix }
}
