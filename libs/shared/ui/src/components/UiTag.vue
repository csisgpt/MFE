<template>
  <a-tag v-bind="$attrs">
    <slot />
  </a-tag>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });
</script>
