<template>
  <Transition name="expand" @leave="leave" @enter="enter" @after-enter="afterEnter">
    <slot />
  </Transition>
</template>

<script lang="ts" setup>
defineSlots<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default(props: Record<string, never>): any
}>()

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

const afterEnter = (element: Element) => {
  if (!(element instanceof HTMLElement))
    throw new Error('Element is not instance of HTMLElement for transition!')
  element.style.height = `auto`
}
const enter = async (element: Element) => {
  if (!(element instanceof HTMLElement))
    throw new Error('Element is not instance of HTMLElement for transition!')
  const { width } = getComputedStyle(element)

  /* eslint-disable no-param-reassign */
  element.style.width = width
  element.style.position = `absolute`
  element.style.visibility = `hidden`
  element.style.height = `auto`
  /* eslint-enable */

  await delay(10)
  const { height } = getComputedStyle(element)

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  element.style.width = null
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  element.style.position = null
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  element.style.visibility = null
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  element.style.height = 0
  /* eslint-enable */

  // Force repaint to make sure the
  // animation is triggered correctly.
  getComputedStyle(element).height

  requestAnimationFrame(() => {
    element.style.height = height
  })
}
const leave = (element: Element) => {
  if (!(element instanceof HTMLElement))
    throw new Error('Element is not instance of HTMLElement for transition!')
  const { height } = getComputedStyle(element)

  element.style.height = height

  // Force repaint to make sure the
  // animation is triggered correctly.
  getComputedStyle(element).height

  requestAnimationFrame(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    element.style.height = 0
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
