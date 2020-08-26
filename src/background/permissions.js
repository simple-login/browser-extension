import browser from "webextension-polyfill";

const listeners = [];

function addPermissionListener(callback) {
  listeners.push(callback);
}

function firePermissionListener() {
  listeners.forEach(callback => callback());
}

async function havePermission(name) {
  return await browser.permissions.contains({
    permissions: [ name ],
    origins: [ 'http://*/*', 'https://*/* '],
  });
}

async function requestPermission(name) {
  const result = await browser.permissions.request({
    permissions: [ name ],
    origins: [ 'http://*/*', 'https://*/* '],
  });
  return result;
}

export { havePermission, requestPermission, addPermissionListener, firePermissionListener };