export type Mailbox = {
  id: string
  email: string
  verified: boolean
  default: string
  creation_timestamp: number
  nb_alias: number
}

export type Suffix = {
  suffix: string
  signed_suffix: string
  is_custom: boolean
  is_premium: boolean
}

export type Alias = {
  id: string
  email: string
  creation_date: string
  creation_timestamp: number
  nb_forward: number
  nb_block: number
  nb_reply: number
  note: string
  mailbox: Mailbox
  mailboxes: Mailbox[]
  support_pgp: boolean
  disable_pgp: boolean
  latest_activity: null | {
    timestamp: number
    action: 'forward' | 'reply' | 'block' | 'bounced'
    contact: {
      email: string
      name: string
      reverse_alias: string
    }
  }
  enabled: boolean
  name: string
  showMoreOptions: boolean
  loading?: boolean
  alias: string
}
