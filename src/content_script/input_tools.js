const InputTools = {
  isLoading: false,

  init() {
    const elements = InputTools.queryEmailInput();
    for (const element of elements) {
      if (element.querySelector('sl-input-wrapper')) {
        continue; // ignore if already has SL button
      } else {
        InputTools.addSLButtonToInput(element);
      }
    }
  },

  addSLButtonToInput(inputElem) {
    // create wrapper element
    const wrapper = InputTools.newDiv('sl-input-wrapper');
    inputElem.parentElement.insertBefore(wrapper, inputElem);

    // create some space for SL button
    inputElem.style.paddingRight = "50px";
    wrapper.appendChild(inputElem);
    const elementSize = getComputedStyle(inputElem);

    // create wrapper for SL button
    const btnWrapper = InputTools.newDiv('sl-button-wrapper');
    btnWrapper.style.height = elementSize.height;
    btnWrapper.style.top = elementSize.marginTop;
    btnWrapper.style.bottom = elementSize.marginBottom;
    wrapper.appendChild(btnWrapper);

    // create the SL button
    const slButton = InputTools.newDiv('sl-button');
    slButton.addEventListener("click", function () {
      InputTools.handleOnClickSLButton(inputElem, slButton);
    });
    btnWrapper.appendChild(slButton);
  },

  newDiv(classes) {
    const div = document.createElement('div');
    div.classList.add(classes);
    return div;
  },

  queryEmailInput() {
    return document.querySelectorAll("input[type='email']");
  },

  async handleOnClickSLButton(inputElem, slButton) {
    if (InputTools.isLoading) {
      return;
    }
    InputTools.isLoading = true;
    slButton.classList.add("loading");

    const res = await InputTools.sendMessageToBackground("NEW_RANDOM_ALIAS");

    InputTools.isLoading = false;
    slButton.classList.remove("loading");

    inputElem.value = res.alias;
  },

  sendMessageToBackground(tag, data = null) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ tag, data }, function (response) {
        resolve(response);
      });
    });
  },
};

InputTools.init();