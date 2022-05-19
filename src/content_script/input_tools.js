if (!window._hasExecutedSlExtension) {
  window._hasExecutedSlExtension = true;

  /**
   * Send message to background.js and resolve with the response
   * @param {string} tag
   * @param {object} data
   */
  const sendMessageToBackground = (tag, data = null) => {
    const _browser = window.chrome || browser;
    return new Promise((resolve) => {
      try {
        _browser.runtime.sendMessage(
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
        console.error(e);
      }
    });
  };

  const slButtonLogic = async () => {
    if (!window.hasSLButton) {
      window.hasSLButton = true;

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
            style.pointerEvents === "auto" &&
            // check if element is not disabled
            !element.disabled &&
            // for example, we must filter out a checkbox with name*=email
            // check if element is text or email input
            (element.type === "text" || element.type === "email")
          );
        },

        addSLButtonToInput(inputElem) {
          // create wrapper for SL button
          const btnWrapper = InputTools.newDiv("sl-button-wrapper");
          const inputSumHeight =
            inputElem.getBoundingClientRect().height + "px";
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

          InputTools.placeBtnToTheRightOfElement(inputElem, btnWrapper);
        },

        newDiv(...className) {
          const div = document.createElement("div");
          div.classList.add(...className);
          return div;
        },

        placeBtnToTheRightOfElement(inputElem, btnWrapper) {
          let intervalId = 0;

          function updatePosition() {
            // check is element is removed from trackedElements
            const i = InputTools.trackedElements.indexOf(inputElem);
            if (i === -1) {
              btnWrapper.parentNode.removeChild(btnWrapper);
              clearInterval(intervalId);
            }

            // get dimension & position of input
            const inputCoords = inputElem.getBoundingClientRect();
            const inputStyle = getComputedStyle(inputElem);
            const elemWidth = InputTools.dimensionToInt(btnWrapper.style.width);
            const pageXOffset = window.pageXOffset;
            const pageYOffset = window.pageYOffset;
            const buttonXOffset =
              SLSettings.SLButtonPosition === "right-inside"
                ? -elemWidth * 1.02
                : elemWidth * 0.02;

            // calculate elem position
            const left =
              InputTools.sumPixel([
                inputCoords.left,
                pageXOffset,
                inputElem.offsetWidth,
                buttonXOffset,
                -inputStyle.paddingRight,
              ]) + "px";

            const top =
              InputTools.sumPixel([inputCoords.top, pageYOffset]) + "px";

            if (btnWrapper.style.left !== left) {
              btnWrapper.style.left = left;
            }

            if (btnWrapper.style.top !== top) {
              btnWrapper.style.top = top;
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

          let res = await sendMessageToBackground("NEW_RANDOM_ALIAS", {
            currentUrl: window.location.href,
          });
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
            sum += !isNaN(dim) ? dim : InputTools.dimensionToInt(dim);
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
      const addMutationObserver = () => {
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
      };

      const SLSettings = await sendMessageToBackground("GET_APP_SETTINGS");
      if (SLSettings.showSLButton) {
        InputTools.init(document);
        addMutationObserver();
      }
    }
  };

  const slRegisterListener = () => {
    if (!window.hasSlListenerRegistered) {
      window.hasSlListenerRegistered = true;

      let hasProcessedSetup = false;

      /**
       * Callback called for every event
       * @param {MessageEvent<any>} event
       */
      const onEvent = async (event) => {
        if (event.source !== window) return;
        if (!event.data.tag) return;
        if (event.data.tag === "PERFORM_EXTENSION_SETUP") {
          if (!hasProcessedSetup) {
            hasProcessedSetup = true;
            await sendMessageToBackground("EXTENSION_SETUP");
          }
        } else if (event.data.tag === "EXTENSION_INSTALLED_QUERY") {
          const res = await sendMessageToBackground(
            "EXTENSION_INSTALLED_QUERY"
          );
          window.postMessage(res);
        }
      };

      window.addEventListener("message", onEvent);
    }
  };

  slButtonLogic();
  slRegisterListener();
}
