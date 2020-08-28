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
            <img class="sl-logo" src="/images/horizontal-logo.svg" />
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

          <div class="content" v-if="step === 2">
            <h5>Create an account</h5>
            <p>
              If you already have an account on SimpleLogin, you can skip this
              step.
            </p>
            <br />
            <button @click="goToCreateNewAccount()" class="btn btn-primary">
              Create a new account
            </button>
            <button @click="nextStep()" class="btn btn-outline-primary">
              I already have account
            </button>
          </div>

          <div class="content" v-if="step === 3">
            <h5>Extra permission</h5>
            <p>
              SimpleLogin extension requires the
              <b>Read and change all your data on the websites you visit</b>
              permission.
            </p>
            <p>
              Though seemingly scary, the only thing SimpleLogin does is to
              detect the email field on a page and display the icon to its
              right.
            </p>
            <p>
              SimpleLogin code is open-source on
              <a href="https://github.com/simple-login/browser-extension"
                >GitHub</a
              >
              if you want to know about what's going behind the scenes.
            </p>
            <p>
              <img src="../images/sl-button-demo.jpg" style="width: 400px;" />
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
              <img src="../images/icon-puzzle.png" style="height: 1.2em;" />
              button.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="arrow-up" v-if="step === 4">
      <img src="../images/arrow-up.png" />
    </div>
  </div>
</template>

<script>
import { havePermission, requestPermission } from "../background/permissions";
import SLStorage from "../popup/SLStorage";

export default {
  data() {
    return {
      step: window.location.href.match(/#step3/) ? 3 : 1,
      isChrome:
        /Chrome/.test(navigator.userAgent) &&
        /Google Inc/.test(navigator.vendor),
    };
  },
  async mounted() {},
  methods: {
    async goToCreateNewAccount() {
      const apiUrl = await SLStorage.get(SLStorage.SETTINGS.API_URL);
      window.location.href = `${apiUrl}/auth/register?next=%2Fdashboard%2Fsetup_done`;
    },
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
  },
};
</script>
