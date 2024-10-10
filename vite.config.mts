/// <reference types="vitest" />

import { fileURLToPath, URL } from 'node:url'
import { readFileSync, existsSync } from 'node:fs'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import Components from 'unplugin-vue-components/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { BootstrapVueNextResolver } from 'bootstrap-vue-next'

const loadDevConfig = () => {
  if (existsSync('./.dev.json')) {
    return JSON.parse(readFileSync('./.dev.json').toString())
  } else {
    return JSON.parse(readFileSync('./.dev.sample.json').toString())
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development'
  const isBeta = !!process.env.BETA
  const isMac = !!process.env.MAC
  const isLite = !!process.env.LITE
  const isFirefox = !!process.env.FIREFOX

  return {
    base: './',
    build: {
      rollupOptions: {
        input: {
          popup: 'index.html',
          background: 'src/extension/background.ts',
          'content_script/input_tools': 'src/extension/input_tools.ts',
          'content_script/input_tools.css': 'src/extension/input_tools.css'
        },
        output: {
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name].[ext]'
        }
      }
    },
    define: {
      devConfig: JSON.stringify(loadDevConfig())
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
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    test: {
      environment: 'jsdom',
      exclude: ['e2e/*'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      transformMode: {
        web: [/\.[jt]sx$/]
      }
    }
  }
})
