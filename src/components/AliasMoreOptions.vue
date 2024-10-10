<!--
Original implementation:
https://github.com/devstark-com/vue-textarea-autosize/blob/8e767ea21863b3e8607b1808b89e7b5a0e3aa98c/src/components/TextareaAutosize.vue

MIT License
-->

<template>
  <ExpandTransition>
    <div v-if="show" class="more-options">
      <label>Mailboxes</label>
      <div>
        <BDropdown size="sm" variant="outline-primary">
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
        v-model="moreOptions.note"
        placeholder="Note, can be anything to help you remember why you created this alias. This field is optional."
        class="form-control"
        style="width: 100%"
        :disabled="loading"
      />

      <label>
        From Name
        <BTooltip placement="top">
          <template #target>
            <QuestionCircleIcon aria-hidden />
          </template>
          This name is used when you send or reply from alias. You may need to use a pseudonym
          because the receiver can see it.
        </BTooltip>
      </label>
      <BFormInput v-model="moreOptions.name" placeholder="From name" :disabled="loading" />

      <div v-if="alias.support_pgp" class="advanced-options mt-2">
        <BFormCheckbox :checked="!moreOptions.disable_pgp" @change="toggleAliasPGP"
          >Enable PGP</BFormCheckbox
        >
      </div>

      <div class="action">
        <button
          class="btn btn-sm btn-primary"
          :disabled="loading || !canSave()"
          @click="handleClickSave"
        >
          <SaveIcon aria-hidden icon="save" />
          {{ btnSaveLabel || 'Save' }}
        </button>

        <button
          class="btn btn-sm btn-delete"
          style="color: #dc3545"
          :disabled="loading"
          @click="handleClickDelete"
        >
          <TrashIcon aria-hidden icon="trash" />
          Delete
        </button>
      </div>
    </div>
  </ExpandTransition>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import ExpandTransition from './ExpandTransition.vue'
import TextareaAutosize from './TextareaAutosize.vue'
import type { Mailbox, Alias } from '../types'
import { useToast } from '../composables/useToast'
import { API_ON_ERR, useDeleteAlias, usePutEditAlias } from '../composables/useApi'
import {
  BDropdown,
  useModalController,
  BDropdownForm,
  BFormCheckbox,
  BFormInput,
  BTooltip
} from 'bootstrap-vue-next'
import { deepClone } from '../utils'
import QuestionCircleIcon from '~icons/fa-solid/question-circle'
import SaveIcon from '~icons/fa-solid/save'
import TrashIcon from '~icons/fa-solid/trash'

const props = withDefaults(
  defineProps<{
    alias: Alias
    show: boolean
    mailboxes: Mailbox[]
    btnSaveLabel?: string
  }>(),
  {
    btnSaveLabel: undefined
  }
)

const emit = defineEmits<{
  changed: [{ data: Alias }]
  deleted: [{ data: Alias }]
}>()

const toast = useToast()
const modal = useModalController()

const moreOptions = ref<Alias>({
  note: '',
  name: '',
  disable_pgp: false,
  mailboxes: [],
  email: '',
  id: '',
  support_pgp: true,
  enabled: true,
  nb_block: undefined,
  nb_forward: undefined,
  nb_reply: undefined,
  showMoreOptions: false,
  alias: '',
  loading: false
})
const hasMailboxesChanges = ref(false) // to be used in canSaved()
const canAlwaysSave = ref(false) // to be used in canSaved()

onMounted(() => {
  watch(
    () => props.show,
    (newValue) => {
      if (newValue) {
        showMoreOptions()
      }
    },
    { immediate: true }
  )

  if (props.btnSaveLabel) {
    canAlwaysSave.value = true
  }
})

const showMoreOptions = () => {
  moreOptions.value = {
    note: props.alias.note,
    name: props.alias.name,
    disable_pgp: !!props.alias.disable_pgp,
    mailboxes: deepClone(props.alias.mailboxes),
    email: '',
    id: '',
    support_pgp: true,
    enabled: true,
    nb_block: undefined,
    nb_forward: undefined,
    nb_reply: undefined,
    showMoreOptions: false,
    alias: ''
  }

  hasMailboxesChanges.value = false
}

const handleClickDelete = async () => {
  if (
    await modal.confirm?.({
      props: {
        title: `Delete ${props.alias.email}`,
        body: 'Do you really want to delete this alias?'
      }
    })
  ) {
    await deleteAlias()
  }
}

const deleteAliasFetch = useDeleteAlias({
  aliasId: () => props.alias.id,
  onError: API_ON_ERR.TOAST
})

const deleteAlias = async () => {
  await deleteAliasFetch.delete()
  emit('deleted', {
    data: props.alias
  })
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

const editAliasFetch = usePutEditAlias({
  aliasId: () => props.alias.id,
  data: computed(() => ({
    note: moreOptions.value.note,
    name: moreOptions.value.name,
    disable_pgp: moreOptions.value.disable_pgp,
    mailbox_ids: moreOptions.value.mailboxes.map((mb) => mb.id)
  }))
})

const loading = computed(() => deleteAliasFetch.isFetching.value || editAliasFetch.isFetching.value)

const handleClickSave = async () => {
  await editAliasFetch.put()
  toast.success({ message: 'Updated alias' })
  emit('changed', {
    data: { ...moreOptions.value, id: props.alias.id }
  })
}

const toggleAliasPGP = () => {
  moreOptions.value.disable_pgp = !moreOptions.value.disable_pgp
}

const findIndexOfMailbox = (id: string, mailboxes: Mailbox[]) => {
  return mailboxes.findIndex((mb) => mb.id === id)
}

const toggleMailbox = (mailbox: Mailbox) => {
  const i = findIndexOfMailbox(mailbox.id, moreOptions.value.mailboxes)
  if (i === -1) {
    moreOptions.value.mailboxes.push(mailbox)
  } else {
    moreOptions.value.mailboxes.splice(i, 1)
  }

  // check if there are changes
  const oldMailboxIds = props.alias.mailboxes
    .map((mb) => mb.id)
    .sort()
    .join(',')
  const newMailboxIds = moreOptions.value.mailboxes
    .map((mb) => mb.id)
    .sort()
    .join(',')
  hasMailboxesChanges.value = oldMailboxIds !== newMailboxIds
}
</script>
