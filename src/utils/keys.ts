import type { InjectionKey, Ref } from 'vue'

export const hasMovedRouterKey: InjectionKey<Ref<boolean>> = Symbol('hasMovedRouter')
