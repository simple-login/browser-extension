The extension is based on https://github.com/Kocal/vue-web-extension boilerplate.

First install all dependencies with `npm install`.

Then in dev mode, run `npm run watch:dev` to generate the `/dist` folder that can be installed into Chrome.

On Firefox, it can be done via `web-ext` tool from within the `/dist` folder: `cd dist/ && web-ext run`

To release, build the production version and zip it via `npm run build && npm run build-zip`
