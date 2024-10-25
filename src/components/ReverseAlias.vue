<template>
  <div class="content">
    <div class="p-2 container">
      <!-- Reverse-alias screen -->
      <div v-if="!createdReverseAlias" class="m-2 p-2">
        <p>
          Send emails from
          <span class="font-weight-bold">{{ alias.email }}</span>
        </p>
        <small>
          To send an email from your alias to a contact, you need to create a
          <b>reverse-alias</b>, a special email address. When you send an email to the
          reverse-alias, the email will be sent from your alias to the contact.<br /><br />
          This Youtube video can also quickly walk you through the steps:
          <a
            href="https://www.youtube.com/watch?v=VsypF-DBaow"
            target="_blank"
            rel="noopener noreferrer"
            >How to send emails from an alias</a
          >
        </small>
        <br /><br />
        <label>
          Receiver:
          <QuestionCircleIcon v-b-tooltip.hover.top="'Where do you want to send the email?'" />
        </label>
        <BFormInput
          v-model="receiverEmail"
          placeholder="First Last &lt;email@example.com&gt;"
          :disabled="loading"
          @keyup.enter="createReverseAlias"
        />
      </div>

      <!-- Created screen -->
      <div v-else class="m-2 p-2">
        <p class="font-weight-bold">
          {{
            createdReverseAlias.existed
              ? 'You have created this reverse-alias before:'
              : 'Reverse-alias is created:'
          }}
        </p>
        <p>
          <a v-b-tooltip.hover title="Click to Copy" class="cursor" @click="copyReverseAlias">
            <span class="text-success">
              {{ createdReverseAlias.reverse_alias }}
            </span>
          </a>
        </p>
        <small>
          You can send email from one of these mailbox(es):
          <ul style="margin-bottom: 0">
            <li v-for="mailbox in alias.mailboxes" :key="mailbox.id">
              {{ mailbox.email }}
            </li>
          </ul>
          The email will be forwarded to
          <b>{{ createdReverseAlias.contact }}</b
          >.<br />
          The receiver will see <b>{{ alias.email }}</b> as your email address.<br />
        </small>
      </div>

      <div class="m-2 p-2">
        <button
          v-if="!createdReverseAlias"
          class="btn btn-sm btn-primary"
          :disabled="loading || !receiverEmail"
          @click="createReverseAlias()"
        >
          Create a reverse-alias
        </button>

        <button v-else class="btn btn-sm btn-primary" @click="backToMainPage">
          <ArrowLeftIcon aria-hidden />
          Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import SLStorage from '../utils/SLStorage'
import { useToast } from '../composables/useToast'
import { BFormInput } from 'bootstrap-vue-next'
import { useRouter } from 'vue-router'
import { usePostCreateReverseAlias } from '../composables/useApi'
import { useClipboard } from '@vueuse/core'
import type { Alias } from '../types'
import QuestionCircleIcon from '~icons/fa-solid/question-circle'
import ArrowLeftIcon from '~icons/fa-solid/arrow-left'

const toast = useToast()
const router = useRouter()

const alias = ref<Alias>(SLStorage.getTemporary('alias') as Alias)
const receiverEmail = ref('')

// Clipboard
const clipboardSuccessHandler = (value: string) => {
  toast.success({ message: `${value} copied to clipboard` })
}

const clipboardErrorHandler = (value: unknown) => {
  console.error('error', value)
}

const {
  execute: createReverseAlias,
  isFetching: loading,
  data
} = usePostCreateReverseAlias({
  aliasId: () => alias.value.id,
  data: computed(() => ({ contact: receiverEmail.value }))
})
const createdReverseAlias = computed(() => data.value ?? null)

const backToMainPage = () => {
  router.go(-1)
}

const createdReverseAliasClipboard = useClipboard({
  source: () => createdReverseAlias.value?.reverse_alias ?? ''
})

const copyReverseAlias = async () => {
  try {
    await createdReverseAliasClipboard.copy()
    clipboardSuccessHandler(createdReverseAlias.value?.reverse_alias ?? '')
  } catch (err) {
    clipboardErrorHandler(err)
  }
}
</script>
