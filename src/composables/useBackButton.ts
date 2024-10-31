import { useRouter } from 'vue-router'
import { computed } from 'vue'

const BackButtonExemptPaths = new Set(['/login', '/', '/main'])

export const useBackButton = ({
  to = '/main'
}: {
  /**
   * Optionally the location in which the back button will navigate to.
   *
   * @default '/main'
   */
  to?: string
} = {}) => {
  const router = useRouter()
  const canGoBack = computed(
    () => BackButtonExemptPaths.has(router.currentRoute.value.path) === false
  )

  return {
    canGoBack,
    push: () => {
      if (canGoBack.value) {
        return router.push(to)
      }
    }
  }
}
