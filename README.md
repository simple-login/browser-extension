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

## How to get the extension

You can directly install the extension by visiting the store page for your browser:

- [Google Chrome / Brave / Opera / Chromium-based](https://chrome.google.com/webstore/detail/simpleloginreceive-send-e/dphilobhebphkdjbpfohgikllaljmgbn) 
- [Mozilla Firefox](https://addons.mozilla.org/firefox/addon/simplelogin/) 
- [Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/simpleloginreceive-sen/diacfpipniklenphgljfkmhinphjlfff)

## Development information

You can find more information about how the extension works and which parts it has in [DEVELOPMENT.md](./DEVELOPMENT.md)

## Contributing Guide

All work on SimpleLogin Chrome/Firefox extension happens directly on GitHub.

This project has been tested with Node v20.2.0 and NPM 9.6.6

To run the extension locally, please follow these steps:

- install all dependencies with `npm install`.
- run `npm start` to generate the `/dist` folder that can be installed into Chrome.

On Firefox, it can be done via `web-ext` tool from within the `/dist` folder: 

```bash 
( cd dist/ ; web-ext run )
```

The code is formatted using `prettier`, make sure to run it before creating the commit, otherwise the GitHub lint workflow will mark the check as not passing:

```bash
npm run prettier:write
```

## How to generate a release

1. Increment the version in `package.json`.
2. Update CHANGELOG with the changes.
3. Create a tag and push it to the repository. The tag name must match the version set in `package.json`.
4. Wait until the CI process generates the extension ZIP and uploads it to GitHub. You will be able to find the generated zip as an artifact attached to the [GitHub release](https://github.com/simple-login/browser-extension/releases).
5. Upload the extension to the Chrome, Firefox and Edge stores.


## How to build the extension locally

In order to build the extension yourself, please follow these steps:

- Make sure you have the dependencies installed and up-to-date with `npm install`.
- Run the build process with `npm run build`.
- Create the zip package with `npm run build-zip`. You will find the extension in the `dist-zip/` directory.
- If you want to use it on Firefox you will need to enter the `dist/` directory and run `web-ext build`. You will find the extension in the `dist/web-ext-artifacts/` directory.  

- (Optional, only useful for beta build) Build beta version: change `betaRev` in `package.json`, then generate zip file using

## How to build a version for Mac

For the development, you can run `npm run start:mac` for the Mac app.

For the production release, `npm run build:mac`

```bash
npm run build:beta && npm run build-zip
```