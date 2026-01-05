<template>
  <a-input v-bind="$attrs">
    <slot />
  </a-input>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });
</script>
