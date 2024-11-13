<template>
  <div style="height: 400px">
    <div class="splash overlay">
      <div class="overlay-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineSlots<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default(props: Record<string, never>): any
}>()
</script>
