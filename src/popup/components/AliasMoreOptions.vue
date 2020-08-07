<template>
  <expand-transition>
    <div class="more-options" v-if="show">
      <label>Mailboxes</label>
      <div>
        <b-dropdown size="sm" variant="outline">
          <b-dropdown-form>
            <b-form-checkbox
              v-for="mailbox in mailboxes"
              :key="mailbox.id"
              :checked="
                findIndexOfMailbox(mailbox.id, moreOptions.mailboxes) !== -1
              "
              @change="toggleMailbox(mailbox)"
            >
              {{ mailbox.email }}
            </b-form-checkbox>
          </b-dropdown-form>
        </b-dropdown>

        {{
          moreOptions.mailboxes.length > 0
            ? moreOptions.mailboxes.map((mb) => mb.email).join(", ")
            : "Please select at least one mailbox"
        }}
      </div>

      <label>Alias Note</label>
      <textarea-autosize
        placeholder="Note, can be anything to help you remember why you created this alias. This field is optional."
        class="form-control"
        style="width: 100%;"
        v-model="moreOptions.note"
        :disabled="loading"
      ></textarea-autosize>

      <label>
        From Name
        <font-awesome-icon
          v-b-tooltip.hover.top="
            'This name is used when you send or reply from alias'
          "
          icon="question-circle"
        />
      </label>
      <b-input
        v-model="moreOptions.name"
        placeholder="From name"
        :disabled="loading"
      />

      <div class="advanced-options mt-2" v-if="alias.support_pgp">
        <b-form-checkbox
          :checked="!moreOptions.disable_pgp"
          @change="toggleAliasPGP"
          >Enable PGP</b-form-checkbox
        >
      </div>

      <div class="action">
        <button
          class="btn btn-sm btn-primary"
          v-on:click="handleClickSave"
          :disabled="loading || !canSave()"
        >
          <font-awesome-icon icon="save" />
          {{ btnSaveLabel || "Save" }}
        </button>

        <button
          class="btn btn-sm btn-delete"
          style="color: #dc3545;"
          v-on:click="handleClickDelete"
          :disabled="loading"
        >
          <font-awesome-icon icon="trash" />
          Delete
        </button>
      </div>
    </div>
  </expand-transition>
</template>

<script>
import Utils from "../Utils";
import SLStorage from "../SLStorage";
import EventManager from "../EventManager";
import Navigation from "../Navigation";
import ExpandTransition from "./ExpandTransition";
import { callAPI, API_ROUTE, API_ON_ERR } from "../APIService";

export default {
  props: {
    alias: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    show: {
      type: Boolean,
      required: true,
    },
    mailboxes: {
      type: Array,
      required: true,
    },
    btnSaveLabel: {
      type: String,
    },
  },
  components: {
    "expand-transition": ExpandTransition,
  },
  data() {
    return {
      moreOptions: {
        note: "",
        name: "",
        disable_pgp: false,
        mailboxes: [],
      },
      loading: false,
      hasMailboxesChanges: false, // to be used in canSaved()
      canAlwaysSave: false, // to be used in canSaved()
    };
  },
  mounted() {
    this.$watch("show", (newValue) => {
      if (newValue) {
        this.showMoreOptions();
      }
    });

    if (this.show) {
      this.showMoreOptions();
    }

    if (this.btnSaveLabel) {
      this.canAlwaysSave = true;
    }
  },
  methods: {
    showMoreOptions() {
      this.moreOptions = {
        note: this.alias.note,
        name: this.alias.name,
        disable_pgp: !!this.alias.disable_pgp,
        mailboxes: Utils.cloneObject(this.alias.mailboxes),
      };

      this.hasMailboxesChanges = false;
    },

    handleClickDelete() {
      this.$modal.show("dialog", {
        title: `Delete ${this.alias.email}`,
        text: "Do you really want to delete this alias?",
        buttons: [
          {
            title: "Yes",
            handler: () => {
              this.$modal.hide("dialog");
              this.deleteAlias();
            },
          },
          {
            title: "No",
            default: true,
            handler: () => {
              this.$modal.hide("dialog");
            },
          },
        ],
      });
    },

    async deleteAlias() {
      this.loading = true;
      const res = await callAPI(
        API_ROUTE.DELETE_ALIAS,
        {
          alias_id: this.alias.id,
        },
        {},
        API_ON_ERR.TOAST
      );
      if (res) {
        this.$emit("deleted", {
          index: this.index,
          data: this.alias,
        });
      } else {
        this.loading = false;
      }
    },

    canSave() {
      return (
        this.moreOptions.mailboxes.length > 0 &&
        (this.alias.note !== this.moreOptions.note ||
          this.alias.name !== this.moreOptions.name ||
          !!this.alias.disable_pgp !== this.moreOptions.disable_pgp ||
          this.hasMailboxesChanges ||
          this.canAlwaysSave)
      );
    },

    async handleClickSave() {
      this.loading = true;
      const savedData = {
        note: this.moreOptions.note,
        name: this.moreOptions.name,
        disable_pgp: this.moreOptions.disable_pgp,
        mailbox_ids: this.moreOptions.mailboxes.map((mb) => mb.id),
      };
      const res = await callAPI(
        API_ROUTE.EDIT_ALIAS,
        {
          alias_id: this.alias.id,
        },
        savedData,
        API_ON_ERR.TOAST
      );
      if (res) {
        Utils.showSuccess("Updated alias");
        this.$emit("changed", {
          index: this.index,
          data: this.moreOptions,
        });
      }
      this.loading = false;
    },

    toggleAliasPGP() {
      this.moreOptions.disable_pgp = !this.moreOptions.disable_pgp;
    },

    findIndexOfMailbox(id, mailboxes) {
      let index = -1;
      for (const i in mailboxes) {
        if (mailboxes[i].id === id) {
          index = i;
        }
      }
      return index;
    },

    toggleMailbox(mailbox) {
      const i = this.findIndexOfMailbox(mailbox.id, this.moreOptions.mailboxes);
      if (i === -1) {
        this.moreOptions.mailboxes.push(mailbox);
      } else {
        this.moreOptions.mailboxes.splice(i, 1);
      }
      this.hasMailboxesChanges = true;
    },
  },
};
</script>
