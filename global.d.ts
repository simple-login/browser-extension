// global.d.ts
export {} // This makes the file a module and fixes the augmentation error

declare global {
  // eslint-disable-next-line no-var
  var devConfig: {
    DEFAULT_API_URL: string
    EXTRA_ALLOWED_DOMAINS: string[]
    permissions: string[]
  }
}
