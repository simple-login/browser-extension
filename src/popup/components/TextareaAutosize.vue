<template>
  <textarea ref="element" :style="computedStyles" v-model="modelValue" @focus="resize"></textarea>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, nextTick, type StyleValue, watch} from 'vue'
import {useVModel} from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    modelValue: string | number
    autosize?: boolean
    minHeight?: number | null
    maxHeight?: number | null
    /*
     * Force !important for style properties
     */
    important?: boolean | string[]
  }>(),
  {
    modelValue: '',
    autosize: true,
    minHeight: null,
    maxHeight: null,
    important: false,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const modelValue = useVModel(props, 'modelValue', emit)

// data property for v-model binding with real textarea tag
// val: null,
// works when content height becomes more then value of the maxHeight property
const maxHeightScroll = ref(false)
const height = ref('auto')
const element = ref<HTMLElement | null>(null)

const computedStyles = computed<StyleValue>(() => {
  if (!props.autosize) return {}
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resize: !isResizeImportant.value ? 'none' : ('none !important' as any), // TODO ? This is a style. Why is it "important"?
    height: height.value,
    overflow: maxHeightScroll.value
      ? 'auto'
      : !isOverflowImportant.value
      ? 'hidden'
      : 'hidden !important',
  }
})
const isResizeImportant = computed(() => {
  const imp = props.important
  return imp === true || (Array.isArray(imp) && imp.includes('resize'))
})
const isOverflowImportant = computed(() => {
  const imp = props.important
  return imp === true || (Array.isArray(imp) && imp.includes('overflow'))
})
const isHeightImportant = computed(() => {
  const imp = props.important
  return imp === true || (Array.isArray(imp) && imp.includes('height'))
})

watch([modelValue, () => props.minHeight, () => props.maxHeight], () => {
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

    const heightVal = contentHeight + 'px'
    height.value = `${heightVal}${important ? ' !important' : ''}`
  })
}

onMounted(resize)
</script>
