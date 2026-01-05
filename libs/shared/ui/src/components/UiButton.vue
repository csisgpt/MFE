<template>
  <a-button v-bind="$attrs">
    <slot />
  </a-button>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });
</script>
