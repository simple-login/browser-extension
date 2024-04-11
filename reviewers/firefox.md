SimpleLogin Chrome/Firefox extension
---

Please find below the instructions for building the SimpleLogin extension from source.

This project has been tested with Node v20.2.0 and NPM 9.6.6.

Please run the following commands to install dependencies and generate a build

```bash
NODE_OPTIONS=--openssl-legacy-provider npm install
npm run build:firefox
npm run build-zip
```

After that the build should be available in `/dist` folder. Its zip file can be found in `dist-zip` folder.