let SLSettings = {};

const InputTools = {
  isLoading: false,

  // store tracked input elements
  trackedElements: [],

  init(target) {
    InputTools.queryEmailInputAndApply(target, (element) => {
      if (!InputTools.isValidEmailInput(element)) {
        return;
      }

      // ignore if this elements has already been tracked
      const i = InputTools.trackedElements.indexOf(element);
      if (i === -1) {
        InputTools.trackedElements.push(element);
        InputTools.addSLButtonToInput(element);
      }
    });
  },

  destroy(target) {
    InputTools.queryEmailInputAndApply(target, (element) => {
      // remove element from tracking list
      const i = InputTools.trackedElements.indexOf(element);
      if (i !== -1) {
        InputTools.trackedElements.splice(i, 1);
      }
    });
  },

  queryEmailInputAndApply(target, actionFunction) {
    if (!target.querySelectorAll) return;
    const elements = target.querySelectorAll(
      "input[type='email'],input[name*='email'],input[id*='email']"
    );
    for (const element of elements) {
      actionFunction(element);
    }
  },

  isValidEmailInput(element) {
    const style = getComputedStyle(element);
    return (
      // check if element is visible
      style.visibility !== "hidden" &&
      style.display !== "none" &&
      style.opacity !== "0" &&
      // check if element is not disabled
      !element.disabled &&
      // for example, we must filter out a checkbox with name*=email
      // check if element is text or email input
      (element.type === "text" || element.type === "email")
    );
  },

  addSLButtonToInput(inputElem, isInputFixed) {
    // create wrapper for SL button
    const btnWrapper = InputTools.newDiv("sl-button-wrapper");
    const inputSumHeight = inputElem.getBoundingClientRect().height + "px";
    btnWrapper.style.height = inputSumHeight;
    btnWrapper.style.width = inputSumHeight;
    document.body.appendChild(btnWrapper);

    // create the SL button
    const slButton = InputTools.newDiv("sl-button");
    slButton.addEventListener("click", function () {
      InputTools.handleOnClickSLButton(inputElem, slButton);
    });
    slButton.style.height = inputSumHeight;
    slButton.style.width = inputSumHeight;
    btnWrapper.appendChild(slButton);

    InputTools.placeElementToTheRight(inputElem, btnWrapper, isInputFixed);
  },

  newDiv(classes) {
    const div = document.createElement("div");
    div.classList.add(classes);
    return div;
  },

  placeElementToTheRight(anchor, elem, isFixed) {
    let intervalId = 0;

    function updatePosition() {
      // check is element is removed from trackedElements
      const i = InputTools.trackedElements.indexOf(anchor);
      if (i === -1) {
        elem.parentNode.removeChild(elem);
        clearInterval(intervalId);
      }

      // get dimension & position of anchor
      const anchorCoords = anchor.getBoundingClientRect();
      const elemWidth = InputTools.dimensionToInt(elem.style.width);
      const pageXOffset = isFixed ? 0 : window.pageXOffset;
      const pageYOffset = isFixed ? 0 : window.pageYOffset;
      const buttonXOffset =
        SLSettings.SLButtonPosition === "right-inside"
          ? -elemWidth * 1.1
          : elemWidth * 0.1;

      // calculate elem position
      const left =
        anchorCoords.left +
        pageXOffset +
        anchor.offsetWidth +
        buttonXOffset +
        "px";

      const top = anchorCoords.top + pageYOffset + "px";

      if (isFixed) {
        elem.style.position = "fixed";
      }

      if (elem.style.left !== left) {
        elem.style.left = left;
      }

      if (elem.style.top !== top) {
        elem.style.top = top;
      }
    }

    intervalId = setInterval(updatePosition, 200);
    updatePosition();
  },

  async handleOnClickSLButton(inputElem, slButton) {
    if (InputTools.isLoading) {
      return;
    }
    InputTools.isLoading = true;
    slButton.classList.add("loading");

    let res = await sendMessageToBackground("NEW_RANDOM_ALIAS");
    if (res.error) {
      alert("SimpleLogin Error: " + res.error);
      res = { alias: "" };
    }

    InputTools.isLoading = false;
    slButton.classList.remove("loading");

    inputElem.value = res.alias;
  },

  sumPixel(dimensions) {
    let sum = 0;
    for (const dim of dimensions) {
      sum += InputTools.dimensionToInt(dim);
    }

    return sum;
  },

  dimensionToInt(dim) {
    try {
      const pixel = parseFloat(dim.replace(/[^0-9.]+/g, ""));
      return isNaN(pixel) ? 0 : pixel;
    } catch (e) {
      return 0;
    }
  },
};

const MutationObserver =
  window.MutationObserver ||
  window.WebKitMutationObserver ||
  window.MozMutationObserver;

/**
 * Add DOM mutations listener
 */
function addMutationObserver() {
  const mutationObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      for (const addedNode of mutation.addedNodes) {
        // add SLButton for newly added nodes
        InputTools.init(addedNode);
      }

      for (const removedNode of mutation.removedNodes) {
        // destroy SLButton for removed nodes
        InputTools.destroy(removedNode);
      }
    });
  });

  const target = document.body;
  if (!target) return;

  mutationObserver.observe(target, {
    childList: true,
    subtree: true,
  });
}

/**
 * Send message to background.js and resolve with the response
 * @param {string} tag
 * @param {object} data
 */
function sendMessageToBackground(tag, data = null) {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage(
        {
          tag,
          data,
        },
        function (response) {
          resolve(response);
        }
      );
    } catch (e) {
      // Extension context invalidated.
      alert("SimpleLogin Error: Please reload the page.");
    }
  });
}

async function initModule() {
  SLSettings = await sendMessageToBackground("GET_APP_SETTINGS");
  if (SLSettings.showSLButton) {
    InputTools.init(document);
    addMutationObserver();
  }
}

initModule();
