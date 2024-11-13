import { join } from 'path'

/**
 * This generates a buildConfig file that is sent to the public folder. It would need to be built before the app is built
 */
const main = async () => {
  const PATH = join(__dirname, '../public', 'buildConfig.json')

  const isLoginWithProtonEnabled = () => {
    const enableLoginWithProton = process.env.ENABLE_LOGIN_WITH_PROTON
    if (enableLoginWithProton == undefined || enableLoginWithProton === 'true') {
      return true
    }
    return false
  }

  const config = {
    features: {
      loginWithProtonEnabled: isLoginWithProtonEnabled()
    },
    buildTime: Date.now()
  }

  await Bun.write(PATH, JSON.stringify(config, null, 2))
}

main()
