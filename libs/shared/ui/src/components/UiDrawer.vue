<template>
  <a-drawer v-bind="$attrs" :open="props.open" @update:open="emit('update:open', $event)">
    <slot />
  </a-drawer>
</template>

<script setup lang="ts">
interface Props {
  open: boolean;
}

defineOptions({ inheritAttrs: false });
const props = defineProps<Props>();
const emit = defineEmits<{ (e: 'update:open', value: boolean): void }>();
</script>
