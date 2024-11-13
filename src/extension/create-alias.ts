import type { UsePostNewRandomAliasReturn } from '../composables/useApi'
import { getHostName, getDefaultNote } from '../utils'
import { newRandomAliasRoute, reloadSettings } from '../utils/api'

/**
 * Create random alias
 */
export const handleNewRandomAlias = async (currentUrl: string | undefined) => {
  await reloadSettings()
  try {
    const res = await fetch(newRandomAliasRoute(await getHostName(currentUrl)), {
      method: 'POST',
      body: JSON.stringify({
        note: await getDefaultNote()
      })
    })

    return (await res.json()) as UsePostNewRandomAliasReturn
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    // rate limit reached
    if (err.response.status === 429) {
      return {
        error: 'Rate limit exceeded - please wait 60s before creating new alias'
      }
    } else if (err.response.data.error) {
      return {
        error: err.response.data.error
      }
    } else {
      return {
        error: 'Unknown error'
      }
    }
  }
}
