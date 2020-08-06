<template>
  <expand-transition>
    <div class="more-options" v-if="show">
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
          Save
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
      },
      loading: false,
    };
  },
  mounted() {
    this.$watch("show", (newValue) => {
      if (newValue) {
        this.moreOptions = {
          note: this.alias.note,
          name: this.alias.name,
          disable_pgp: !!this.alias.disable_pgp,
        };
      }
    });
  },
  methods: {
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
        this.$emit("deleted", this.index);
      } else {
        this.loading = false;
      }
    },
    canSave() {
      return (
        this.alias.note !== this.moreOptions.note ||
        this.alias.name !== this.moreOptions.name ||
        !!this.alias.disable_pgp !== this.moreOptions.disable_pgp
      );
    },
    async handleClickSave() {
      this.loading = true;
      const savedData = {
        note: this.moreOptions.note,
        name: this.moreOptions.name,
        disable_pgp: this.moreOptions.disable_pgp,
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
  },
};
</script>
