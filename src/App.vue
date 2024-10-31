<template>
  <div ref="container" class="app" :class="{ 'ff-overflow-menu': isInsideOverflowMenu }">
    <Suspense>
      <SlHeader :use-compact-layout="isInsideOverflowMenu" />
    </Suspense>
    <Suspense>
      <RouterView />
      <template #fallback>
        <SplashScreenAbstract />
      </template>
    </Suspense>
    <BToastOrchestrator />
    <BModalOrchestrator />
  </div>
</template>

<script setup lang="ts">
import { onMounted, useTemplateRef, computed } from 'vue'
import SlHeader from './components/SlHeader.vue'
import { useRouter } from 'vue-router'
import { useElementBounding, useWindowSize } from '@vueuse/core'
import { initService as initApiService } from './utils/api'
import SplashScreenAbstract from './components/SplashScreenAbstract.vue'
import { useTheme } from './composables/useTheme'

const router = useRouter()
useTheme()

const container = useTemplateRef('container')

const { width: windowWidth } = useWindowSize()
const { width: appWidth } = useElementBounding(container)

const isInsideOverflowMenu = computed(() => windowWidth.value < appWidth.value)

onMounted(async () => {
  await initApiService()
  router.push('/')
})
</script>
