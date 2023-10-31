/// <reference types="vitest" />
import {existsSync, readFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'

import {defineConfig, type UserConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import icons from 'unplugin-icons/vite'
import legacy from '@vitejs/plugin-legacy'
import Components from 'unplugin-vue-components/vite'
import {BootstrapVueNextResolver} from 'unplugin-vue-components/resolvers'

const loadDevConfig = () => {
  // TODO Race condition
  if (existsSync('./.dev.json')) {
    return JSON.parse(readFileSync('./.dev.json').toString())
  }
  return JSON.parse(readFileSync('./.dev.sample.json').toString())
}

const devConfig = loadDevConfig()

// https://vitejs.dev/config/
export default defineConfig(() => {
  const mode = process.env.NODE_ENV
  const define: UserConfig['define'] = {}

  if (mode === 'development') {
    define.devConfig = JSON.stringify(devConfig)
    define['process.env.BETA'] = JSON.stringify(!!process.env.BETA)
  }

  if (process.env.MAC) {
    define['process.env.MAC'] = JSON.stringify(!!process.env.MAC)
  }

  if (mode === 'production') {
    define.devConfig = null
    define['process.env'] = {
      NODE_ENV: 'production',
      BETA: JSON.stringify(!!process.env.BETA),
    }
  }

  return {
    build: {
      // It's an extension, all code is bundled up so this is a non-issue
      chunkSizeWarningLimit: 5000,
    },
    plugins: [
      icons({
        autoInstall: true,
        compiler: 'vue3',
      }),
      vue(),
      legacy({
        targets: ['defaults', 'not IE 11'],
      }),
      Components({
        resolvers: [BootstrapVueNextResolver()],
      }),
    ],
    define,
    test: {
      environment: 'happy-dom',
      exclude: ['e2e/*'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      transformMode: {
        web: [/\.[jt]sx$/],
      },
    },
  }
})
