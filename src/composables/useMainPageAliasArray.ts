import type { Alias } from '../types'
import { computed, ref, type Ref } from 'vue'
import { usePostGetAliases } from './useApi'
import { useInfiniteScroll } from '@vueuse/core'

export const useMainPageAliasArray = (contentElem: Ref<HTMLElement | null>) => {
  const aliasArray = ref<Alias[]>([])
  const searchString = ref('')
  const currentPage = ref(0)

  const postGetAliases = usePostGetAliases({
    pageId: currentPage,
    data: computed(() => ({
      query: searchString.value
    })),
    useFetchOptions: {
      onFetchError(ctx) {
        ctx.error.customMessage = 'Cannot fetch list alias'
        return ctx
      }
    }
  })
  const isFetchingAliases = computed(() => postGetAliases.isFetching.value)

  let aliasesAppearsEnd = 0
  const loadAlias = async () => {
    await postGetAliases.execute()
    if (
      Array.isArray(postGetAliases.data.value?.aliases) &&
      postGetAliases.data.value?.aliases.length === 0
    ) {
      aliasesAppearsEnd += 1
    }
    aliasArray.value = ((currentAliases: Alias[], newAliases: Alias[]) => {
      // dict of aliasId and alias to speed up research
      const newAliasesDict: Record<string, Alias> = {}
      for (let i = 0; i < newAliases.length; i++) {
        const alias = newAliases[i]
        newAliasesDict[alias.id] = alias
      }

      const ret: Alias[] = []

      // keep track of added aliases
      const alreadyAddedId: Record<string, boolean> = {}
      for (let i = 0; i < currentAliases.length; i++) {
        const alias = currentAliases[i]
        if (newAliasesDict[alias.id]) ret.push(newAliasesDict[alias.id])
        else ret.push(alias)

        alreadyAddedId[alias.id] = true
      }

      for (let i = 0; i < newAliases.length; i++) {
        const alias = newAliases[i]
        if (!alreadyAddedId[alias.id]) {
          ret.push(alias)
        }
      }

      return ret
    })(aliasArray.value, postGetAliases.data.value?.aliases || [])
  }

  const infiniteList = useInfiniteScroll(
    contentElem,
    async () => {
      if (isFetchingAliases.value || infiniteList.isLoading.value) return
      currentPage.value += 1
      await loadAlias()
    },
    { distance: 500, canLoadMore: () => aliasesAppearsEnd <= 5 }
  )

  const resetAndLoadAlias = async () => {
    aliasesAppearsEnd = 0
    currentPage.value = 0
    aliasArray.value = []
    await loadAlias()
  }

  return {
    aliasArray,
    isFetchingAliases,
    handleAliasDeleted: (event: { data: Alias }) => {
      const index = aliasArray.value.findIndex((el) => el.id === event.data.id)
      if (index === -1) return
      aliasArray.value.splice(index, 1)
    },
    handleAliasChanged: (event: { data: Alias }) => {
      const index = aliasArray.value.findIndex((el) => el.id === event.data.id)
      if (index === -1) return
      const alias = aliasArray.value[index]
      aliasArray.value.splice(index, 1, { ...alias, ...event.data })
    },
    toggleMoreOptions: (value: Alias) => {
      const alias = aliasArray.value.find((el) => el.id === value.id)
      if (!alias) return
      alias.showMoreOptions = !alias.showMoreOptions
    },
    resetSearch: async () => {
      searchString.value = ''
      await resetAndLoadAlias()
    },
    searchString,
    resetAndLoadAlias
  }
}
