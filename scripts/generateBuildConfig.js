const fs = require('fs');
const path = require('path');

const PATH = path.join(__dirname, '../src', 'popup', 'buildConfig.json');

const isLoginWithProtonEnabled = () => {
    const enableLoginWithProton = process.env.ENABLE_LOGIN_WITH_PROTON;
    if (enableLoginWithProton == undefined || enableLoginWithProton === 'true') {
        return true;
    }
    return false;
};

const config = {
  features: {
    loginWithProtonEnabled: isLoginWithProtonEnabled()
  },
  buildTime: new Date().getTime()
};

fs.writeFileSync(PATH, JSON.stringify(config, null, 2));
