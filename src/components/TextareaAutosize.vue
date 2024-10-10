<template>
  <textarea ref="element" v-model="val" :style="computedStyles" @focus="resize" />
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch, nextTick, type StyleValue, useTemplateRef } from 'vue'

const props = withDefaults(
  defineProps<{
    autosize?: boolean
    minHeight?: number | null
    maxHeight?: number | null
    /*
     * Force !important for style properties
     */
    important?: boolean | string[]
  }>(),
  {
    autosize: true,
    minHeight: null,
    maxHeight: null,
    important: false
  }
)

const element = useTemplateRef('element')

const val = defineModel<string | number>({
  required: true
})

// works when content height becomes more then value of the maxHeight property
const maxHeightScroll = ref(false)
const height = ref('auto')

const computedStyles = computed<StyleValue>(() => {
  if (!props.autosize) return {}
  return {
    resize: 'none',
    height: height.value,
    overflow: maxHeightScroll.value
      ? 'auto'
      : !isOverflowImportant.value
        ? 'hidden'
        : 'hidden !important'
  }
})
const isOverflowImportant = computed(() => {
  const imp = props.important
  return imp === true || (Array.isArray(imp) && imp.includes('overflow'))
})
const isHeightImportant = computed(() => {
  const imp = props.important
  return imp === true || (Array.isArray(imp) && imp.includes('height'))
})

watch([val, () => props.minHeight, () => props.maxHeight], () => {
  nextTick(resize)
})

watch(
  () => props.autosize,
  (val) => {
    if (val) resize()
  }
)

const resize = () => {
  const important = isHeightImportant.value ? 'important' : ''
  height.value = `auto${important ? ' !important' : ''}`
  nextTick(() => {
    let contentHeight = (element.value?.scrollHeight ?? 0) + 1

    if (props.minHeight) {
      contentHeight = contentHeight < props.minHeight ? props.minHeight : contentHeight
    }

    if (props.maxHeight) {
      if (contentHeight > props.maxHeight) {
        contentHeight = props.maxHeight
        maxHeightScroll.value = true
      } else {
        maxHeightScroll.value = false
      }
    }

    const heightVal = `${contentHeight}px`
    height.value = `${heightVal}${important ? ' !important' : ''}`
  })
}

onMounted(() => {
  resize()
})
</script>
