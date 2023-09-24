<template>
  <div class="content">
    <div class="p-2 container">
      <!-- Reverse-alias screen -->
      <div class="m-2 p-2" v-if="!createdReverseAlias">
        <p>
          Send emails from
          <span class="font-weight-bold">{{ alias.email }}</span>
        </p>
        <small>
          To send an email from your alias to a contact, you need to create a
          <b>reverse-alias</b>, a special email address. When you send an email
          to the reverse-alias, the email will be sent from your alias to the
          contact.<br /><br />
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
          <font-awesome-icon
            v-b-tooltip.hover.top="'Where do you want to send the email?'"
            icon="question-circle"
          />
        </label>
        <b-input
          v-model="receiverEmail"
          v-on:keyup.enter="createReverseAlias"
          placeholder="First Last &lt;email@example.com&gt;"
          :disabled="loading"
        />
      </div>

      <!-- Created screen -->
      <div class="m-2 p-2" v-else>
        <p class="font-weight-bold">
          {{
            createdReverseAlias.existed
              ? "You have created this reverse-alias before:"
              : "Reverse-alias is created:"
          }}
        </p>
        <p>
          <a
            @click="copyToClipboard"
            v-b-tooltip.hover
            title="Click to Copy"
            class="cursor"
          >
            <span class="text-success">
              {{ createdReverseAlias.reverse_alias }}
            </span>
          </a>
        </p>
        <small>
          You can send email from one of these mailbox(es):
          <ul style="margin-bottom: 0">
            <li v-for="mailbox in alias.mailboxes" v-bind:key="mailbox.id">
              {{ mailbox.email }}
            </li>
          </ul>
          The email will be forwarded to
          <b>{{ createdReverseAlias.contact }}</b
          >.<br />
          The receiver will see <b>{{ alias.email }}</b> as your email
          address.<br />
        </small>
      </div>

      <div class="m-2 p-2">
        <button
          class="btn btn-sm btn-primary"
          @click="createReverseAlias"
          :disabled="loading || !receiverEmail"
          v-if="!createdReverseAlias"
        >
          Create a reverse-alias
        </button>

        <button class="btn btn-sm btn-primary" @click="backToMainPage" v-else>
          <font-awesome-icon icon="arrow-left" />
          Back
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'
import SLStorage from "../SLStorage";
import Navigation from "../Navigation";
import Utils from "../Utils";
import { callAPI, API_ROUTE, API_ON_ERR } from "../APIService";
import {useClipboard} from '@vueuse/core'

const alias = SLStorage.getTemporary("alias")

const createdReverseAlias = ref(null)
const loading = ref(false)
const receiverEmail = ref("")

const {copy} = useClipboard()

/** 
 * @param {string} value
 */
 const clipboardSuccessHandler = (value) => {
  Utils.showSuccess(`${value} copied to clipboard`);
}

/**
 * 
 * @param {any} error 
 */
const clipboardErrorHandler = (error) => {
  console.error("error", error);
}

const copyToClipboard = async () => {
  try{
    await copy(createdReverseAlias.reverse_alias)
    clipboardSuccessHandler(createdReverseAlias.reverse_alias)
  }
  catch(e) {
    clipboardErrorHandler(e)
  }
}

const backToMainPage = () => {
  Navigation.navigateBack();
}

// Create reverse-alias
const createReverseAlias = async () => {
  loading.value = true;
  const response = await callAPI(
    API_ROUTE.CREATE_REVERSE_ALIAS,
    {
      alias_id: alias.id,
    },
    {
      contact: receiverEmail.value,
    },
    API_ON_ERR.TOAST
  );
  createdReverseAlias.value = response ? response.data : null;
  loading.value = false;
}
</script>
