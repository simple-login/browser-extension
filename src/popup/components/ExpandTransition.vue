<template>
  <Transition name="expand" @after-enter="onAfterEnter" @enter="onEnter" @leave="onLeave">
    <slot />
  </Transition>
</template>

<script setup lang="ts">
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

const onAfterEnter = (element: HTMLElement) => {
  element.style.height = `auto`
}
const onEnter = async (element: HTMLElement) => {
  const {width} = getComputedStyle(element)

  element.style.width = width
  element.style.position = `absolute`
  element.style.visibility = `hidden`
  element.style.height = `auto`

  await delay(10)
  const {height} = getComputedStyle(element)

  element.style.width = 'null'
  element.style.position = 'null'
  element.style.visibility = 'null'
  element.style.height = '0'

  // Force repaint to make sure the
  // animation is triggered correctly.
  // eslint-disable-next-line no-unused-expressions
  getComputedStyle(element).height

  requestAnimationFrame(() => {
    element.style.height = height
  })
}
const onLeave = (element: HTMLElement) => {
  const {height} = getComputedStyle(element)

  element.style.height = height

  // Force repaint to make sure the
  // animation is triggered correctly.
  // eslint-disable-next-line no-unused-expressions
  getComputedStyle(element).height

  requestAnimationFrame(() => {
    element.style.height = '0'
  })
}
</script>

<style scoped>
* {
  will-change: height;
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
</style>

<style>
.expand-enter-active,
.expand-leave-active {
  transition: height 0.2s ease-in-out;
  overflow: hidden;
}

.expand-enter,
.expand-leave-to {
  height: 0;
}
</style>
