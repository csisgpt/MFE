<template>
  <a-form-item v-bind="$attrs">
    <slot />
  </a-form-item>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });
</script>
