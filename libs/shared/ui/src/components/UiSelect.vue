<template>
  <a-select v-bind="$attrs">
    <slot />
  </a-select>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });
</script>
