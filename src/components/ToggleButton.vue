<template>
  <BFormCheckbox
    v-model="modelValue"
    switch
    :style="{
      width: 30,
      height: 18,
      '--bs-switch-bg': '#b02a8f', // Background color when checked
      '--bs-switch-border-color': '#b02a8f' // Border color when checked
    }"
  />
</template>

<script setup lang="ts">
const modelValue = defineModel<boolean>({
  required: true
})
</script>
