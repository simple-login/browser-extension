import browser from "webextension-polyfill";

const listeners = [];

/**
 * To be used by background.js
 * @param {function} callback
 */
function addPermissionListener(callback) {
  listeners.push(callback);
}

/**
 * To be used by background.js
 */
function firePermissionListener() {
  listeners.forEach((callback) => callback());
}

/**
 * Can be used by both frontend & background
 * @param {string} name name of permission
 */
async function havePermission(name) {
  return await browser.permissions.contains({
    permissions: [name],
    origins: ["http://*/*", "https://*/* "],
  });
}

/**
 * To be called on frontend (on user interaction)
 * @param {string} name name of permission
 */
async function requestPermission(name) {
  const result = await browser.permissions.request({
    permissions: [name],
    origins: ["http://*/*", "https://*/* "],
  });
  // emit "changed" event to background
  if (result) {
    browser.runtime.sendMessage({ tag: "PERMISSIONS_CHANGED" });
  }
  return result;
}

export {
  havePermission,
  requestPermission,
  addPermissionListener,
  firePermissionListener,
};
