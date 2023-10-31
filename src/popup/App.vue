<template>
  <div class="app" :class="{'ff-overflow-menu': isInsideOverflowMenu}">
    <SlHeader :useCompactLayout="isInsideOverflowMenu" />
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {initService, setToasted} from './utils'
import {useRouter} from 'vue-router'

const router = useRouter()

const isInsideOverflowMenu = ref(false)

const detectOverflowMenu = () => {
  const appElem = document.querySelector('.app')
  if (appElem === null) return
  const appWidth = +getComputedStyle(appElem).width.replace('px', '')
  const windowWidth = window.innerWidth
  if (windowWidth < appWidth) {
    isInsideOverflowMenu.value = true
  }
}

onMounted(async () => {
  await initService()
  setToasted(this.$toasted)
  router.replace('/')
  detectOverflowMenu()
})
</script>
