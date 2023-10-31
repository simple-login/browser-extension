<!--
Original implementation:
https://github.com/devstark-com/vue-textarea-autosize/blob/8e767ea21863b3e8607b1808b89e7b5a0e3aa98c/src/components/TextareaAutosize.vue

MIT License
-->

<template>
  <ExpandTransition>
    <div class="more-options" v-if="show">
      <label>Mailboxes</label>
      <div>
        <BDropdown size="sm" variant="outline">
          <BDropdownForm>
            <BFormCheckbox
              v-for="mailbox in mailboxes"
              :key="mailbox.id"
              :checked="findIndexOfMailbox(mailbox.id, moreOptions.mailboxes) !== -1"
              @change="toggleMailbox(mailbox)"
            >
              {{ mailbox.email }}
            </BFormCheckbox>
          </BDropdownForm>
        </BDropdown>

        {{
          moreOptions.mailboxes.length > 0
            ? moreOptions.mailboxes.map((mb) => mb.email).join(', ')
            : 'Please select at least one mailbox'
        }}
      </div>

      <label>Alias Note</label>
      <TextareaAutosize
        placeholder="Note, can be anything to help you remember why you created this alias. This field is optional."
        class="form-control"
        style="width: 100%"
        v-model="moreOptions.note"
        :disabled="loading"
      />

      <label>
        From Name
        <FaQuestionCircleIcon
          v-b-tooltip.hover.top="
            'This name is used when you send or reply from alias. You may need to use a pseudonym because the receiver can see it.'
          "
        />
      </label>
      <BInput v-model="moreOptions.name" placeholder="From name" :disabled="loading" />

      <div class="advanced-options mt-2" v-if="alias.support_pgp">
        <BFormCheckbox :checked="!moreOptions.disable_pgp" @change="toggleAliasPGP"
          >Enable PGP</BFormCheckbox
        >
      </div>

      <div class="action">
        <button
          class="btn btn-sm btn-primary"
          v-on:click="handleClickSave"
          :disabled="loading || !canSave()"
        >
          <FaSaveIcon />
          {{ btnSaveLabel || 'Save' }}
        </button>

        <button
          class="btn btn-sm btn-delete"
          style="color: #dc3545"
          v-on:click="handleClickDelete"
          :disabled="loading"
        >
          <FaTrashIcon />
          Delete
        </button>
      </div>
    </div>
  </ExpandTransition>
</template>

<script setup lang="ts">
import {ref, onMounted, watch} from 'vue'
import {
  showSuccess,
  cloneObject,
  editAlias as apiEditAlias,
  deleteAlias as apiDeleteAlias,
  API_ON_ERR,
} from '../utils'
import FaTrashIcon from '~icons/fa/trash'
import FaSaveIcon from '~icons/fa/save'
import FaQuestionCircleIcon from '~icons/fa/question-circle'
import {vBTooltip} from 'bootstrap-vue-next'

const props = defineProps<{
  alias: Record<string, any>
  index: number
  show: boolean
  mailboxes: any[]
  btnSaveLabel?: string
}>()

const emit = defineEmits<{
  deleted: [value: {index: number; data: any}]
  changed: [value: {index: number; data: any}]
}>()

const moreOptions = ref({
  note: '',
  name: '',
  disable_pgp: false,
  mailboxes: [] as any[],
})
const loading = ref(false)
const hasMailboxesChanges = ref(false) // to be used in canSaved()
const canAlwaysSave = ref(!!props.btnSaveLabel) // to be used in canSaved()

watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      showMoreOptions()
    }
  }
)

onMounted(() => {
  if (props.show) {
    showMoreOptions()
  }
})

const showMoreOptions = () => {
  moreOptions.value = {
    note: props.alias.note,
    name: props.alias.name,
    disable_pgp: !!props.alias.disable_pgp,
    mailboxes: cloneObject(props.alias.mailboxes),
  }

  hasMailboxesChanges.value = false
}

const handleClickDelete = () => {
  this.$modal.show('dialog', {
    title: `Delete ${props.alias.email}`,
    text: 'Do you really want to delete this alias?',
    buttons: [
      {
        title: 'Yes',
        handler: () => {
          this.$modal.hide('dialog')
          deleteAlias()
        },
      },
      {
        title: 'No',
        default: true,
        handler: () => {
          this.$modal.hide('dialog')
        },
      },
    ],
  })
}

const deleteAlias = async () => {
  loading.value = true
  try {
    const res = await apiDeleteAlias(props.alias.id, {
      errHandlerMethod: API_ON_ERR.TOAST,
    })
    if (res) {
      emit('deleted', {
        index: props.index,
        data: props.alias,
      })
    }
  } finally {
    loading.value = false
  }
}

const canSave = () => {
  return (
    moreOptions.value.mailboxes.length > 0 &&
    (props.alias.note !== moreOptions.value.note ||
      props.alias.name !== moreOptions.value.name ||
      !!props.alias.disable_pgp !== moreOptions.value.disable_pgp ||
      hasMailboxesChanges.value ||
      canAlwaysSave.value)
  )
}

const handleClickSave = async () => {
  loading.value = true
  try {
    const savedData = {
      note: moreOptions.value.note,
      name: moreOptions.value.name,
      disable_pgp: moreOptions.value.disable_pgp,
      mailbox_ids: moreOptions.value.mailboxes.map((mb) => mb.id),
    }
    const res = await apiEditAlias(
      props.alias.id,
      {
        savedData,
      },
      {errHandlerMethod: API_ON_ERR.TOAST}
    )
    if (res) {
      showSuccess('Updated alias')
      emit('changed', {
        index: props.index,
        data: moreOptions.value,
      })
    }
  } finally {
    loading.value = false
  }
}

const toggleAliasPGP = () => {
  moreOptions.value.disable_pgp = !moreOptions.value.disable_pgp
}

const findIndexOfMailbox = (id: any, mailboxes: any[]) => mailboxes.findIndex((el) => el.id === id)

const toggleMailbox = (mailbox: any) => {
  const i = findIndexOfMailbox(mailbox.id, moreOptions.value.mailboxes)
  if (i === -1) {
    moreOptions.value.mailboxes.push(mailbox)
  } else {
    moreOptions.value.mailboxes.splice(i, 1)
  }

  // check if there are changes
  const oldMailboxIds = props.alias.mailboxes
    .map((mb: any) => mb.id)
    .sort()
    .join(',')
  const newMailboxIds = moreOptions.value.mailboxes
    .map((mb) => mb.id)
    .sort()
    .join(',')
  hasMailboxesChanges.value = oldMailboxIds !== newMailboxIds
}
</script>
