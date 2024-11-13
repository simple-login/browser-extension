<template>
  <tr>
    <td>
      <slot name="aside" />
    </td>
    <td>
      <slot name="title" /> <br />
      <small>
        <slot name="description" />
      </small>
      <slot name="bottom" />
    </td>
  </tr>
</template>

<script setup lang="ts">
defineSlots<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  aside?(props: Record<string, never>): any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  title(props: Record<string, never>): any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  description(props: Record<string, never>): any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bottom?(props: Record<string, never>): any
}>()
</script>
