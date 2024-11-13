import { ref } from 'vue'
import SLStorage from '../utils/SLStorage'
import type { MustacheViewKeys } from '../types'
import mustache from 'mustache'

export const useMainPageSuggestedPrefix = async () => {
  const aliasPrefixMustacheTemplate: string | null =
    (await SLStorage.getItem('ALIAS_PREFIX_MUSTACHE_TEMPLATE')) || null

  const aliasPrefix = ref('')

  const setAliasPrefixWithMustache = (suggestion: string) => {
    console.log(suggestion)
    if (!aliasPrefixMustacheTemplate) return suggestion
    return mustache.render(aliasPrefixMustacheTemplate, {
      suggested: () => suggestion,
      random: () => Math.floor(Math.random() * (6 - 2 + 1) + 2).toString()
    } satisfies Record<MustacheViewKeys, unknown>)
  }

  return { aliasPrefix, setAliasPrefixWithMustache }
}
