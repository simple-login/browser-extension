const fs = require('fs');
const path = require('path');

const PATH = path.join(__dirname, '../src', 'popup', 'buildConfig.json');

const config = {
  features: {
    loginWithProtonEnabled: process.env.ENABLE_LOGIN_WITH_PROTON === 'true'
  },
  buildTime: new Date().getTime()
};

fs.writeFileSync(PATH, JSON.stringify(config, null, 2));