<template>
  <BFormCheckbox v-model="modelValue" :wrapper-attrs switch variant="primary" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ tag?: string }>(), {
  tag: undefined
})

const modelValue = defineModel<boolean>({
  required: true
})

const wrapperAttrs = computed(() => (props.tag ? { tag: props.tag } : undefined))
</script>
