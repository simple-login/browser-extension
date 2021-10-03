<template>
  <div class="content">
    <div class="p-2 container">
      <!-- Reverse-alias screen -->
      <div class="m-2 p-2" v-if="!createdReverseAlias">
        <p>
          Create reverse-alias for
          <span class="font-weight-bold">{{ alias.email }}</span>
        </p>
        <small>
          To send an email from your alias to a contact, you need to create a
          reverse-alias, a special email address. When you send an email to the
          reverse-alias, the email will be sent from your alias to the
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
          placeholder="First Last &lt;email@example.com&gt;"
          :disabled="loading"
        />
      </div>

      <!-- Created screen -->
      <div class="m-2 p-2" v-else>
        <p class="font-weight-bold">Reverse-alias is created:</p>
        <p>
          <a
            v-clipboard="() => createdReverseAlias.reverse_alias_address"
            v-clipboard:success="clipboardSuccessHandler"
            v-clipboard:error="clipboardErrorHandler"
            v-b-tooltip.hover
            title="Click to Copy"
            class="cursor"
          >
            <span class="text-success">
              {{ createdReverseAlias.reverse_alias_address }}
            </span>
          </a>
        </p>
        <small>
          Emails sent to this address will be forwarded to
          <b>{{ createdReverseAlias.contact }}</b
          >. The receiver will see <b>{{ alias.email }}</b> as your email.<br />
          You can use this reverse-alias from one of these mailbox(es):<br />
          <ul>
            <li v-for="mailbox in alias.mailboxes" v-bind:key="mailbox.id">
              {{ mailbox.email }}
            </li>
          </ul>
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

<script>
import SLStorage from "../SLStorage";
import Navigation from "../Navigation";
import Utils from "../Utils";
import { callAPI, API_ROUTE, API_ON_ERR } from "../APIService";

export default {
  data() {
    return {
      alias: SLStorage.getTemporary("alias"),
      createdReverseAlias: null,
      loading: false,
      receiverEmail: "",
    };
  },
  methods: {
    // Clipboard
    clipboardSuccessHandler({ value, event }) {
      Utils.showSuccess(value + " copied to clipboard");
    },

    clipboardErrorHandler({ value, event }) {
      console.error("error", value);
    },

    // Create reverse-alias
    async createReverseAlias() {
      const { data } = await callAPI(
        API_ROUTE.CREATE_REVERSE_ALIAS,
        {
          alias_id: this.alias.id,
        },
        {
          contact: this.receiverEmail,
        },
        API_ON_ERR.TOAST
      );
      this.createdReverseAlias = data;
      this.loading = false;
    },

    backToMainPage() {
      Navigation.navigateBack();
    },
  },
  computed: {},
};
</script>
