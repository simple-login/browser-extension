import {writeFileSync} from 'node:fs'
import {join} from 'node:path'

const PATH = join(__dirname, '../src', 'popup', 'buildConfig.json')

const isLoginWithProtonEnabled = () => {
  const enableLoginWithProton = import.meta.env.ENABLE_LOGIN_WITH_PROTON
  if (enableLoginWithProton == undefined || enableLoginWithProton === 'true') {
    return true
  }
  return false
}

const config = {
  features: {
    loginWithProtonEnabled: isLoginWithProtonEnabled(),
  },
  buildTime: new Date().getTime(),
}

writeFileSync(PATH, JSON.stringify(config, null, 2))
