export type AliasOptions = {
  recommendation?: {alias: string}
  suffixes: string[] // TODO I don't think this type is correct
  prefix_suggestion: string
  can_create: boolean
}
