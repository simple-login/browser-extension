<template>
  <div class="app" :class="{ 'ff-overflow-menu': isInsideOverflowMenu }">
    <SlHeader :use-compact-layout="isInsideOverflowMenu" />
    <RouterView />
    <BToastOrchestrator />
    <BModalOrchestrator />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

import SlHeader from './components/SlHeader.vue'
import { getSavedTheme, setThemeClass } from './utils/Theme'
import { useRouter } from 'vue-router'
import { useColorMode } from '@vueuse/core'
import { BToastOrchestrator, BModalOrchestrator } from 'bootstrap-vue-next'
import { initService as initApiService } from './utils/api'

const router = useRouter()
const color = useColorMode({})

const isInsideOverflowMenu = ref(false)
const appScale = ref(1)

const detectOverflowMenu = () => {
  const appElem = document.querySelector('.app')
  if (appElem) {
    const appWidth = +getComputedStyle(appElem).width.replace('px', '')
    const windowWidth = window.innerWidth
    if (windowWidth < appWidth) {
      isInsideOverflowMenu.value = true
    }
  }
}

onMounted(async () => {
  await initApiService()
  await setThemeClass(await getSavedTheme())
  router.push('/')
  detectOverflowMenu()
})
</script>
