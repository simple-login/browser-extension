/* eslint-disable @typescript-eslint/ban-ts-comment */
/// <reference types="vitest" />

import { fileURLToPath, URL } from 'node:url'
import { writeFile } from 'node:fs/promises'
import {resolve} from 'node:path'

import { defineConfig, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { BootstrapVueNextResolver } from 'bootstrap-vue-next'

import packageJson from './package.json' assert { type: 'json' }
import manifest from './public/manifest.json' assert { type: 'json' }

const transformManifest = (): Plugin => ({
  name: 'vite-plugin-transform-manifest',

  async writeBundle() {
    const myManifest = manifest
    // @ts-ignore
    myManifest.version = packageJson.version
    myManifest.permissions = [
      ...myManifest.permissions,
      ...(process.env.PERMISSIONS?.split(',') || [])
    ]

    if (process.env.VITE_BETA) {
      const geckoId = myManifest.browser_specific_settings.gecko.id
      myManifest.name = 'SimpleLogin BETA'
      // @ts-ignore
      myManifest.icons = {
        '48': 'icons/icon_beta_48.png',
        '128': 'icons/icon_beta_128.png'
      }
      // @ts-ignore
      myManifest.version = packageJson.version + '.' + packageJson.betaRev
      myManifest.browser_specific_settings.gecko.id = geckoId.replace('@', '-beta@')
    }

    if (process.env.FIREFOX) {
      // @ts-ignore
      myManifest.background = {
        scripts: ['background/background.js']
      }
    } else {
      // CHROME
      // @ts-ignore
      myManifest.background = {
        service_worker: 'background/background.js',
        type: 'module'
      }
    }

    if (process.env.LITE) {
      // Remove "All sites" permissions
      const PERMISSIONS_TO_REMOVE = ['https://*/*', 'http://*/*']

      const finalPermissions = []
      for (const perm of myManifest.permissions) {
        if (!PERMISSIONS_TO_REMOVE.includes(perm)) {
          finalPermissions.push(perm)
        }
      }
      myManifest.permissions = finalPermissions

      // Change metadata
      myManifest.name = 'SimpleLogin Without SL icon'
      myManifest.short_name = 'SimpleLogin Without SL icon'
    }

    if (process.env.VITE_MAC) {
      myManifest.permissions.push('nativeMessaging')
    }

    console.info(myManifest)
    await writeFile(resolve(__dirname, 'dist', 'manifest.json'), JSON.stringify(myManifest, null, 2))
  }
})

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        popup: 'index.html',
        background: 'src/extension/background.ts',
        'content_script/input_tools': 'src/extension/input_tools.ts',
        'content_script/input_tools.css': 'src/extension/input_tools.css'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background/[name].js'; // output to dist/background
          }
          if (chunkInfo.name === 'popup') {
            return 'popup/[name].js'; // output to dist/popup
          }
          if (chunkInfo.name.startsWith('content_script/input_tools')) {
            return 'assets/content_script/input_tools.js'; // output to dist/assets/content_script/input_tools.js
          }
          return 'assets/[name].[hash].js'; // default for other JS assets
        },
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
        
      },
    }
  },
  plugins: [
    vue(),
    Icons({
      autoInstall: false,
      compiler: 'vue3'
    }),
    Components({
      dts: true,
      resolvers: [IconsResolver(), BootstrapVueNextResolver()]
    }),
    transformManifest()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    environment: 'jsdom',
    exclude: ['e2e/*'],
    root: fileURLToPath(new URL('./', import.meta.url))
  }
})
