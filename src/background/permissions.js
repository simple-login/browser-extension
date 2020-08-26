import browser from "webextension-polyfill";

async function havePermission(name) {
  return await browser.permissions.contains({
    permissions: [ name ],
    origins: [ 'http://*/*', 'https://*/* '],
  });
}

async function requestPermission(name) {
  return await browser.permissions.request({
    permissions: [ name ],
    origins: [ 'http://*/*', 'https://*/* '],
  });
}

export { havePermission, requestPermission };