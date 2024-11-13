# CONTRIBUTING

This document contains an overview on how the extension is organized, which parts does it have and how does it work.

## General overview

The extension consists of 2 main screens:

- main screen: displays email alias recommendation, alias creation and existing alias.
- new alias screen: when a new alias is created, user is redirected to this screen so they can copy it.

## How to change the domain where the extension is connecting to

In order to change the backend URL, you will need to:

1. Copy the `.dev.sample.json` file into a `.dev.json` file.
2. Edit the `DEFAULT_API_URL` parameter and enter the URL you want to use.
3. You may need to run `bun start` again in order for the changes to take effect.

## How does the extension setup work

The extension setup process works like the following:

1. The webpage sends a message (the code can be found [here](https://github.com/simple-login/app/blob/0e3be23acc7978f6e2b1127ed78dc2147cf43515/templates/onboarding/index.html#L41-L42) and [here](https://github.com/simple-login/app/blob/0e3be23acc7978f6e2b1127ed78dc2147cf43515/templates/onboarding/setup_done.html#L31-L32))
2. The extension has a listener for events on the page, and detects it [like this](https://github.com/simple-login/browser-extension/blob/55629849838b716dabcb008898c97c4ee1118da1/src/content_script/input_tools.js#L257)
3. Once the event has been detected, the extension sends it to the background context [with this call](https://github.com/simple-login/browser-extension/blob/55629849838b716dabcb008898c97c4ee1118da1/src/content_script/input_tools.js#L260)
4. The background context [detects the event](https://github.com/simple-login/browser-extension/blob/master/src/background/index.js#L119-L120) and performs the setup. This message can only come from one of the authorized domains (see the "Add custom allowed domains" section to see how this works).
5. The setup consists on a HTTP request that will use the cookies for the SimpleLogin domain, and it will receive an API Key in the response. This API Key will be stored on the `SLStorage` and be used from then on.
6. Once the setup has been done, the user will be redirected to a page where they will be able to test the extension.

Here you have a full definition of the flow:

1. Once the extension is installed, the user will be prompted with a webpage (`/onboarding`) where two things can happen:
   1. If the user is already logged in, the webpage will send the message for performing the extension setup.
      1. Once the setup is done, they will be redirected to the `/onboarding/final` page.
   2. If the user is not logged in, they will be prompted to log in.
      1. After they log in, they will be redirected to the `/onboarding/setup_done` page.
      2. The page will send the message for performing the extension setup.
      3. Once the setup is done, they will be redirected to the `/onboarding/final` page.
2. Once the user reaches the `/onboarding/final` page, the extension will be correctly set up, the user will be able to use it, and the page will contain the extension version at the bottom of the page

## Add custom allowed domains

The messages for both performing the extension setup and for checking if it's installed are only allowed if they come from a [predefined set of origins](https://github.com/simple-login/browser-extension/blob/55629849838b716dabcb008898c97c4ee1118da1/src/background/index.js#L72-L77).

However, for testing purposes there is a parameter that can be added to your dev config. You can find it in your `.dev.json`, under the name `EXTRA_ALLOWED_DOMAINS`.

Keep in mind that the domains you write here will be converted to regex, so if you want to allow `*.local` you may need to write it as `.*.local`. Also take into account that only the hostname portion will be used (that means, if your page is `someserver.com:1234` only the `someserver.com` portion will be evaluated).
