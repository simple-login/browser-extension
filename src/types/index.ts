export type Mailbox = {
  id: string
  email: string
}

export type Alias = {
  enabled: boolean
  note: string
  name: string
  disable_pgp: boolean
  mailboxes: Mailbox[]
  email: string
  id: string
  // TODO this doesn't look right. AliasMoreOptions.vue
  support_pgp: boolean
  showMoreOptions: boolean
  nb_block: unknown
  nb_forward: unknown
  nb_reply: unknown
  loading?: boolean
  alias: string
}
