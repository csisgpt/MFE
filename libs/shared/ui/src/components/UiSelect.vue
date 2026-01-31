<template>
  <a-select class="min-w-[200px]!" v-bind="$attrs">
    <slot />
  </a-select>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false });
</script>
