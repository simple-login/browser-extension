<template>
  <div class="content">
    <!-- Login/register screen -->
    <div v-if="!isShowMfa" class="p-6 container" style="min-height: 350px">
      <h1 class="h5 mb-3">
        Welcome to
        <a href="https://simplelogin.io" target="_blank"
          >SimpleLogin <LongArrowAltUpIcon :rotate="45" /></a
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
          :href="`${apiUrl}/auth/proton/login?next=/onboarding/setup_done`"
        >
          <img class="mr-2" src="/images/proton.svg" />
          Login with Proton
        </a>
      </div>

      <div class="text-center mt-2">
        <button class="mt-2 btn btn-link text-center" @click="showApiKeySetup">
          Sign in with API Key
        </button>
      </div>

      <div class="text-center">
        Don't have an account yet?
        <a :href="`${apiUrl}/auth/register?next=%2Fdashboard%2Fsetup_done`" target="_blank">
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
            placeholder="xxxxxx"
            autofocus
            class="form-control mt-3 w-100"
            @keyup.enter="submitMfaCode"
          />
          <button class="btn btn-primary btn-block mt-2" @click="submitMfaCode">Submit</button>
        </div>
      </div>
    </div>
    <!-- END MFA screen -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import SLStorage from '../utils/SLStorage'
import EventManager from '../utils/EventManager'
import { useToast } from '../composables/useToast'
import { getDeviceName } from '../utils'
import { useRouter } from 'vue-router'
import { API_ON_ERR, usePostLogin, usePostMFA } from '../composables/useApi'
import { useApiUrl } from '../composables/useApiUrl'
import LongArrowAltUpIcon from '~icons/fa-solid/long-arrow-alt-up'

const loginWithProtonEnabled = ref(false)

onMounted(async () => {
  const fetchLoginWithProton = async () => {
    try {
      const res = await fetch('/buildConfig.json')
      if (!res.ok) throw new Error('Failed to load config')
      const data = await res.json()
      loginWithProtonEnabled.value = data.features.loginWithProtonEnabled
    } catch (error) {
      console.error('Failed to load config', error)
    }
  }
  await fetchLoginWithProton()
})

const router = useRouter()

const toast = useToast()

const email = ref('')
const password = ref('')
const mfaKey = ref('')
const mfaCode = ref('')
const isShowMfa = ref(false)
const { apiUrl } = useApiUrl()

const sayHiToast = (userName: string) => {
  return toast.success({ message: `Hi ${userName}!` })
}

const useLogin = usePostLogin({
  onError: API_ON_ERR.TOAST,
  useFetchOptions: {
    onFetchError(ctx) {
      if (ctx.error.response.status === 403) {
        ctx.error.customMessage =
          'WebAuthn/FIDO is not supported on browser extension yet, please use API Key to login'
      } else {
        ctx.error.customMessage = 'Email or Password incorrect'
      }
      return ctx
    }
  },
  data: computed(() => ({
    email: email.value,
    password: password.value,
    device: getDeviceName()
  }))
})

const login = async () => {
  await useLogin.post()
  const data = useLogin.data
  if (data.value?.api_key) {
    const userName = data.value?.name || data.value?.email
    await SLStorage.setItem(SLStorage.SETTINGS.API_KEY, data.value?.api_key)
    EventManager.broadcast(EventManager.EVENT.SETTINGS_CHANGED)

    sayHiToast(userName)

    router.replace('/main')
  } else if (data.value?.mfa_enabled && data.value.mfa_key) {
    mfaKey.value = data.value.mfa_key
    isShowMfa.value = true
  }
}

const useMFA = usePostMFA({
  useFetchOptions: {
    onFetchError(ctx) {
      ctx.error.customMessage = 'Incorrect MFA Code'
      return ctx
    }
  },
  data: computed(() => ({
    mfa_token: mfaCode.value,
    mfa_key: mfaKey.value,
    device: getDeviceName()
  }))
})

const submitMfaCode = async () => {
  await useMFA.post()
  const data = useMFA.data
  const userName = data.value?.name || data.value?.email
  if (data.value?.api_key) {
    await SLStorage.setItem(SLStorage.SETTINGS.API_KEY, data.value.api_key)
  }
  EventManager.broadcast(EventManager.EVENT.SETTINGS_CHANGED)

  sayHiToast(userName ?? '')

  router.replace('/main')
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
