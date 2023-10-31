<template>
  <div class="content">
    <!-- Login/register screen -->
    <div v-if="!isShowMfa" class="p-6 container" style="min-height: 350px">
      <h1 class="h5 mb-3">
        Welcome to
        <a href="https://simplelogin.io" target="_blank"
          >SimpleLogin <FaLongArrowAltUpIcon :transform="{rotate: 45}" /></a
        >, the most powerful email alias solution!
      </h1>

      <form @submit.prevent="login">
        <div class="form-group">
          <label>Email</label>

          <input v-model="email" class="form-control" type="email" autofocus required />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input v-model="password" type="password" class="form-control" />
        </div>

        <button class="btn btn-primary btn-block mt-2">Login</button>
      </form>

      <!-- Login with Proton -->
      <div v-if="loginWithProtonEnabled">
        <div class="text-center my-2 text-gray"><span>or</span></div>

        <a
          class="btn btn-primary btn-block mt-2 proton-button"
          target="_blank"
          :href="apiUrl + '/auth/proton/login?next=/onboarding/setup_done'"
        >
          <img class="mr-2" src="/images/proton.svg" />
          Login with Proton
        </a>
      </div>

      <div class="text-center mt-2">
        <button @click="showApiKeySetup" class="mt-2 btn btn-link text-center">
          Sign in with API Key
        </button>
      </div>

      <div class="text-center">
        Don't have an account yet?
        <a :href="apiUrl + '/auth/register?next=%2Fdashboard%2Fsetup_done'" target="_blank">
          Sign Up
        </a>
      </div>
    </div>
    <!-- END Login/register screen -->

    <!-- MFA screen -->
    <div v-else class="p-6 container" style="min-height: 350px">
      <div class="p-3">
        <div class="mb-2">Your account is protected with Two Factor Authentication. <br /></div>

        <div>
          <b>Token</b>
          <p>Please enter the 2FA code from your 2FA authenticator</p>
        </div>

        <div style="margin: auto">
          <input
            v-model="mfaCode"
            v-on:keyup.enter="submitMfaCode"
            placeholder="xxxxxx"
            autofocus
            class="form-control mt-3 w-100"
          />
          <button @click="submitMfaCode" class="btn btn-primary btn-block mt-2">Submit</button>
        </div>
      </div>
    </div>
    <!-- END MFA screen -->
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {
  EventManager,
  SLStorage,
  getBuildConfig,
  getDeviceName,
  showSuccess,
  showError,
  login as apiLogin,
  mfa,
} from '../utils'
import FaLongArrowAltUpIcon from '~icons/fa/long-arrow-alt-up'
import {useRouter} from 'vue-router'

const router = useRouter()

const email = ref('')
const password = ref('')
const mfaKey = ref('')
const mfaCode = ref('')
const isShowMfa = ref(false)
const apiUrl = ref('')
const loginWithProtonEnabled = ref(getBuildConfig().features.loginWithProtonEnabled)

onMounted(async () => {
  apiUrl.value = await SLStorage.get(SLStorage.settings.apiUrl)
})

const login = async () => {
  try {
    const {data} = await apiLogin({
      email: email.value,
      password: password.value,
      device: getDeviceName(),
    })

    if ('api_key' in data) {
      const userName = data.name || data.email
      await SLStorage.set(SLStorage.settings.apiKey, data.api_key)
      EventManager.broadcast(EventManager.settingsChangedEvent)

      showSuccess(`Hi ${userName}!`)

      router.replace('/main')
    } else if (data.mfa_enabled) {
      mfaKey.value = data.mfa_key
      isShowMfa.value = true
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    // FIDO
    if (err.response.status === 403) {
      showError(
        'WebAuthn/FIDO is not supported on browser extension yet, please use API Key to login'
      )
    } else {
      showError('Email or Password incorrect')
    }
  }
}

const submitMfaCode = async () => {
  try {
    const {data} = await mfa({
      mfa_token: mfaCode.value,
      mfa_key: mfaKey.value,
      device: getDeviceName(),
    })

    const userName = data.name || data.email
    await SLStorage.set(SLStorage.settings.apiKey, data.api_key)
    EventManager.broadcast(EventManager.settingsChangedEvent)

    showSuccess(`Hi ${userName}!`)

    router.replace('/main')
  } catch (err) {
    showError('Incorrect MFA Code')
    mfaCode.value = ''
  }
}

const showApiKeySetup = () => {
  router.push('/api-key-setting')
}
</script>

<style lang="css">
.proton-button {
  border-color: #6d4aff;
  background-color: var(--bg-color);
  color: #6d4aff;
}
.proton-button:hover {
  border-color: #6d4aff;
  background-color: #1b1340;
  color: var(--text-color);
}
.text-gray {
  color: #868e96;
}
</style>
