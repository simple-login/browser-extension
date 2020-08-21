SimpleLogin Chrome/Firefox extension
---
<p>
<a href="https://chrome.google.com/webstore/detail/simplelogin-protect-your/dphilobhebphkdjbpfohgikllaljmgbn">
    <img src="https://img.shields.io/chrome-web-store/rating/dphilobhebphkdjbpfohgikllaljmgbn?label=Chrome%20Extension">
</a>

<a href="https://addons.mozilla.org/en-GB/firefox/addon/simplelogin/">
<img src="https://img.shields.io/amo/rating/simplelogin?label=Firefox%20Add-On&logo=SimpleLogin">
</a>

<a href="./LICENSE">
<img src="https://img.shields.io/github/license/simple-login/app">
</a>

</p>

SimpleLogin is the **open-source** privacy-first email alias and Single Sign-On (SSO) Identity Provider.

More info on our website at https://simplelogin.io

The extension uses VueJS with https://github.com/Kocal/vue-web-extension boilerplate.

## General information

The extension consists of 3 main screens:

- setup screen for first-time user. Here user can create and paste the `API Key` that's stored in `chrome.storage`.
- main screen: displays email alias recommendation, alias creation and existing alias.
- new alias screen: when a new alias is created, user is redirected to this screen so they can copy it.

## Contributing Guide

All work on SimpleLogin Chrome/Firefox extension happens directly on GitHub.

To run the extension locally, please follow these steps:

- install all dependencies with `npm install`.

- run `npm run watch:dev` to generate the `/dist` folder that can be installed into Chrome.

On Firefox, it can be done via `web-ext` tool from within the `/dist` folder: ` ( cd dist/ ; web-ext run )`

The code is formatted using `prettier`, make sure to run it before creating the commit :).

## To build the project

Build the production version and zip it via 
```bash
npm run build && npm run build-zip
```

Build beta version: change `betaRev` in `package.json`, then generate zip file using 

```bash
npm run build:beta && npm run build-zip
```
