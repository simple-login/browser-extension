export type MFALoginData = {
  mfa_enabled: boolean
  mfa_key: string
}

export type LoginData = {
  name: string
  email: string
  api_key: string
}

export type LoginResponse = MFALoginData | LoginData
