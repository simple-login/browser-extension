const InputTools = {
  isLoading: false,
  processedElements: [],

  init(target) {
    InputTools.queryEmailInputAndApply(target, (element) => {
      const i = InputTools.processedElements.indexOf(element);
      if (i === -1) {
        InputTools.processedElements.push(element);
        InputTools.addSLButtonToInput(element);
      }
    });
  },

  destroy(target) {
    InputTools.queryEmailInputAndApply(target, (element) => {
      const i = InputTools.processedElements.indexOf(element);
      if (i !== -1) {
        InputTools.processedElements.splice(i, 1);
      }
    });
  },

  queryEmailInputAndApply(target, actionFunction) {
    if (!target.querySelectorAll) return;
    const elements = target.querySelectorAll(
      "input[type='email'],input[name*='email']"
    );
    for (const element of elements) {
      actionFunction(element);
    }
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
      // check is element is removed
      const i = InputTools.processedElements.indexOf(anchor);
      if (i === -1) {
        elem.parentNode.removeChild(elem);
        clearInterval(intervalId);
      }

      // get dimension & position of anchor
      const anchorCoords = anchor.getBoundingClientRect();
      const elemWidth = InputTools.dimensionToInt(elem.style.width);
      const pageXOffset = isFixed ? 0 : window.pageXOffset;
      const pageYOffset = isFixed ? 0 : window.pageYOffset;

      // calculate elem position
      const left =
        anchorCoords.left +
        pageXOffset +
        anchor.offsetWidth -
        elemWidth * 1.2 +
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

function addMutationObserver() {
  const mutationObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      //console.log(mutation.target);

      for (const removedNode of mutation.removedNodes) {
        InputTools.destroy(removedNode);
      }

      InputTools.init(mutation.target);
    });
  });

  const target = document.body;
  if (!target) return;

  mutationObserver.observe(target, {
    childList: true,
    subtree: true,
  });
}

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
  const canShowSLButton = await sendMessageToBackground("CAN_SHOW_SL_BUTTON");
  if (canShowSLButton) {
    InputTools.init(document);
    addMutationObserver();
  }
}

initModule();
