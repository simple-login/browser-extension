<template>
  <div class="app">
    <div class="row">
      <div class="col-3 screen-left">
        <div class="left-content">
          <p :class="{ active: step === 2 }" @click="toStep(2)">Account</p>
          <p :class="{ active: step === 3 }" @click="toStep(3)">Permission</p>
          <p :class="{ active: step === 4 }" @click="toStep(4)">Done</p>
        </div>
      </div>
      <div class="col-6 screen-right">
        <div class="right-content">
          <div class="header">
            <img
              alt="SimpleLogin logo"
              class="sl-logo"
              src="/images/horizontal-logo.svg"
            />
          </div>

          <div class="content" v-if="step === 1">
            <h5>Thank you for installing SimpleLogin!</h5>
            <p>
              SimpleLogin is an open-source email alias solution to defend your
              personal email address against spams, phishing and to protect your
              privacy.
            </p>
            <br />
            <button @click="nextStep()" class="btn btn-primary">
              Get started!
            </button>
          </div>

          <div class="content mb-2" v-if="step === 2">
            <h5>Create an account</h5>
            <p>
              If you already have an account on SimpleLogin, you can skip this
              step.
            </p>
            <br />
            <a :href="url.createNewAccount" class="btn btn-primary">
              Create a new account
            </a>
            <a :href="url.login" class="btn btn-outline-primary">
              I already have account
            </a>
          </div>

          <div class="content" v-if="step === 3">
            <div v-if="isAuthenticated">
              <h1 class="h2 text-primary">Welcome {{ userName }}!</h1>
              <hr />
            </div>

            <h5>Extra permission</h5>
            <p>
              SimpleLogin extension requires the
              <b v-if="isChrome"
                >Read and change all your data on the websites you visit</b
              >
              <b v-else
                >Access your data for all websites & access browser tabs</b
              >
              permission.
            </p>

            <img
              v-if="isChrome"
              src="../images/chrome-permission-screenshot.png"
              style="width: 400px;"
            />
            <img
              v-else
              src="../images/firefox-permission-screenshot.png"
              style="width: 400px;"
            />

            <p>
              Though seemingly scary, the only thing SimpleLogin does is to
              detect the email field on a page and display the icon to its
              right.
            </p>

            <img
              alt="SimpleLogin Button demo"
              src="../images/sl-button-demo.png"
              style="width: 400px;"
              class="mb-3"
            />

            <p>
              SimpleLogin code is open-source on
              <a
                href="https://github.com/simple-login/browser-extension"
                target="_blank"
                rel="noopener noreferrer"
                >GitHub</a
              >
              if you want to know about what's going behind the scenes.
            </p>

            <br />
            <button @click="askTabsPermission()" class="btn btn-primary">
              Approve access permission
            </button>
            <button
              @click="nextStep()"
              class="btn"
              style="color: #888; font-size: 0.8em;"
            >
              Skip
            </button>
          </div>

          <div class="content" v-if="step === 4">
            <h5>It's all set!</h5>
            <p>
              To start using SimpleLogin, please click on
              <img
                alt="SimpleLogin"
                src="../images/icon-simplelogin.png"
                style="height: 1.2em;"
              />
              icon at the corner of your browser.
            </p>
            <p
              v-if="isChrome"
              class="alert alert-primary"
              style="border-left: 5px #467fcf solid;"
            >
              Note: this icon maybe hidden under
              <img
                alt="Extension Menu"
                src="../images/icon-puzzle.png"
                style="height: 1.2em;"
              />
              button.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="arrow-up" v-if="step === 4">
      <img alt="It is up here" src="../images/arrow-up.png" />
    </div>
  </div>
</template>

<script>
import { requestPermission } from "../background/permissions";
import SLStorage from "../popup/SLStorage";
import axios from "axios";
import { API_ROUTE } from "../popup/APIService";
import EventManager from "../popup/EventManager";

export default {
  data() {
    return {
      step: 1,
      isChrome:
        /Chrome/.test(navigator.userAgent) &&
        /Google Inc/.test(navigator.vendor),
      isAuthenticated: false,
      userName: "",
      url: {
        createNewAccount: "",
        login: "",
      },
    };
  },
  async mounted() {
    // get URL for buttons
    const apiUrl = await SLStorage.get(SLStorage.SETTINGS.API_URL);
    this.url.createNewAccount = `${apiUrl}/auth/register?next=%2Fdashboard%2Fsetup_done`;
    this.url.login = `${apiUrl}/dashboard/setup_done`;

    // maybe user redirected from the setup_done page
    if (this.step === 3) {
      await this.tryGetUserInfo();
    }

    // update setup step
    const self = this;
    const updateStep = function () {
      self.step = window.location.href.match(/#step3/) ? 3 : 1;
    };
    window.addEventListener("hashchange", updateStep, false);
    updateStep();
  },
  methods: {
    toStep(i) {
      this.step = i;
    },
    nextStep() {
      this.step = this.step + 1;
    },
    async askTabsPermission() {
      if (await requestPermission("tabs")) {
        this.nextStep();
      } else {
        alert(
          "Please approve permissions. If you don't want to approve, please click Skip button."
        );
      }
    },
    async tryGetUserInfo() {
      const apiUrl = await SLStorage.get(SLStorage.SETTINGS.API_URL);
      const that = this;

      // check api key
      axios
        .get(apiUrl + API_ROUTE.GET_USER_INFO.path, {
          headers: { Authentication: this.apiKey },
        })
        .then(async (res) => {
          that.userName = res.data.name || res.data.email;
          that.isAuthenticated = true;

          await SLStorage.set(SLStorage.SETTINGS.API_KEY, this.apiKey);
          EventManager.broadcast(EventManager.EVENT.SETTINGS_CHANGED);
        })
        .catch((err) => {
          // user isn't authenticated, ignore
        });
    },
  },
};
</script>
