<template>
  <section class="ui-page">
    <slot />
  </section>
</template>

<script setup lang="ts"></script>

<style scoped>
.ui-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 0 24px;
}
</style>
