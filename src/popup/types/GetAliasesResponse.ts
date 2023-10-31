export type Aliases = {
  id: string
  enabled: boolean
  email: string
  showMoreOptions: boolean
  note: string
  nb_forward: string // TODO I don't think this type is correct
  nb_reply: string // TODO I don't think this type is correct
  nb_block: string // TODO I don't think this type is correct
}

export type GetAliasesResponse = {
  aliases: Aliases[]
}
