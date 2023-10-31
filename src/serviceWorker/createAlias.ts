import {
  getHostName,
  getDefaultNote,
  newRandomAlias,
  API_ON_ERR,
  reloadSettings,
} from '../popup/utils'

/**
 * Create random alias
 */
const handleNewRandomAlias = async (currentUrl: string) => {
  await reloadSettings()
  const hostname = await getHostName(currentUrl)
  if (!hostname) throw new Error('Hostname is undefined')
  try {
    const {data} = await newRandomAlias(
      hostname,
      {note: await getDefaultNote()},
      {
        errHandlerMethod: API_ON_ERR.THROW,
      }
    )

    return data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    // rate limit reached
    if (err.response.status === 429) {
      return {
        error: 'Rate limit exceeded - please wait 60s before creating new alias',
      }
    } else if (err.response.data.error) {
      return {
        error: err.response.data.error,
      }
    } else {
      return {
        error: 'Unknown error',
      }
    }
  }
}

export {handleNewRandomAlias}
