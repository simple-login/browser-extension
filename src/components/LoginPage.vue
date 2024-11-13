<template>
  <div class="content">
    <!-- Login/register screen -->
    <BContainer v-if="!isShowMfa" class="p-6" style="min-height: 350px">
      <h1 class="h5 mb-3">
        Welcome to
        <BLink icon variant="primary" href="https://simplelogin.io" target="_blank">
          SimpleLogin
          <LongArrowAltUpIcon
            aria-hidden
            style="transform: rotate(45deg) translate(1px, -3px)"
            width="8"
          /> </BLink
        >, the most powerful email alias solution!
      </h1>

      <BForm>
        <BFormGroup class="mb-3" label="Email" label-for="email-input">
          <BFormInput
            id="email-input"
            v-model="email"
            :state="v$.email.$dirty ? !v$.email.$error : null"
            type="email"
            autofocus
            @input="v$.email.$touch"
            @blur="v$.email.$touch"
          />
        </BFormGroup>

        <BFormGroup label="Password" class="mb-3" label-for="password-input">
          <BInputGroup>
            <template #append>
              <BButton
                type="button"
                @click="passwordType = passwordType === 'password' ? 'text' : 'password'"
              >
                <EyeIcon v-if="passwordType === 'password'" />
                <EyeSlashIcon v-else />
              </BButton>
            </template>
            <BFormInput
              id="password-input"
              v-model="password"
              :state="v$.password.$dirty ? !v$.password.$error : null"
              :type="passwordType"
              @input="v$.password.$touch"
              @blur="v$.password.$touch"
            />
          </BInputGroup>
        </BFormGroup>

        <BButton type="button" variant="primary" class="w-100 mt-2" @click="login">Login</BButton>
      </BForm>

      <!-- Login with Proton -->
      <div v-if="loginWithProtonEnabled">
        <div class="text-center my-2 text-gray"><span>or</span></div>

        <BButton
          :variant="null"
          class="w-100 mt-2 proton-button"
          target="_blank"
          :href="`${apiUrl}/auth/proton/login?next=/onboarding/setup_done`"
        >
          <img class="me-2" src="/images/proton.svg" />
          Login with Proton
        </BButton>
      </div>

      <div class="text-center mt-2">
        <BButton type="button" variant="link" class="mt-2 text-center" @click="showApiKeySetup">
          Sign in with API Key
        </BButton>
      </div>

      <div class="text-center">
        Don't have an account yet?
        <BLink
          variant="primary"
          :href="`${apiUrl}/auth/register?next=%2Fdashboard%2Fsetup_done`"
          target="_blank"
        >
          Sign Up
        </BLink>
      </div>
    </BContainer>
    <!-- END Login/register screen -->

    <!-- MFA screen -->
    <BContainer v-else class="p-6" style="min-height: 350px">
      <div class="p-3">
        <div class="mb-2">Your account is protected with Two Factor Authentication. <br /></div>

        <div>
          <b>Token</b>
          <p>Please enter the 2FA code from your 2FA authenticator</p>
        </div>

        <div style="margin: auto">
          <BFormInput
            v-model="mfaCode"
            placeholder="xxxxxx"
            autofocus
            class="mt-3 w-100"
            @keyup.enter="submitMfaCode"
          />
          <BButton variant="primary" class="w-100 mt-2" type="button" @click="submitMfaCode">
            Submit
          </BButton>
        </div>
      </div>
    </BContainer>
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
import EyeSlashIcon from '~icons/fa-solid/eye-slash'
import EyeIcon from '~icons/fa-solid/eye'
import { useVuelidate } from '@vuelidate/core'
import { required, email as emailValidator } from '@vuelidate/validators'

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
const passwordType = ref<'password' | 'text'>('password')
const mfaKey = ref('')
const mfaCode = ref('')
const isShowMfa = ref(false)
const { apiUrl } = await useApiUrl()

const v$ = useVuelidate(
  {
    email: { required, email: emailValidator },
    password: { required }
  },
  { email, password }
)

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
  if (!(await v$.value.$validate())) return
  await useLogin.execute()
  const data = useLogin.data
  if (data.value?.api_key) {
    const userName = data.value?.name || data.value?.email
    await SLStorage.setItem('API_KEY', data.value?.api_key)
    EventManager.broadcast('SETTINGS_CHANGED')

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
  await useMFA.execute()
  const data = useMFA.data
  const userName = data.value?.name || data.value?.email
  if (data.value?.api_key) {
    await SLStorage.setItem('API_KEY', data.value.api_key)
  }
  EventManager.broadcast('SETTINGS_CHANGED')

  sayHiToast(userName ?? '')

  router.replace('/main')
}

const showApiKeySetup = () => {
  router.push('/api-key-setting')
}
</script>

<style lang="css">
.proton-button {
  border-color: #6d4aff !important;
  background-color: var(--bg-color) !important;
  color: #6d4aff !important;
}
.proton-button:hover {
  border-color: #6d4aff !important;
  background-color: #1b1340 !important;
  color: var(--text-color) !important;
}
.text-gray {
  color: #868e96;
}
</style>
