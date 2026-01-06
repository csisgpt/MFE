<template>
  <a-form v-bind="$attrs">
    <slot />
  </a-form>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });
</script>
