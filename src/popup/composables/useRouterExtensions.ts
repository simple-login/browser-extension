import {toRef} from 'vue'
import {useRouter} from 'vue-router'

export default () => {
  const router = useRouter()

  const canGoBack = toRef(() => router.history.index > 0)

  const clearHistoryAndNavigateTo = (path: string) => {
    router.history.stack = []
    router.history.index = -1
    setTimeout(() => router.push(path), 10)
  }

  return {canGoBack, clearHistoryAndNavigateTo}
}
