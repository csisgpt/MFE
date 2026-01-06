<template>
  <a-card v-bind="$attrs">
    <slot />
  </a-card>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });
</script>
