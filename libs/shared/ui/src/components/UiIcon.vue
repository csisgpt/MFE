<template>
  <component :is="iconComponent" :size="size" :stroke-width="strokeWidth" aria-hidden="true" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  FileText,
  Home,
  LayoutGrid,
  LogOut,
  Menu,
  Pencil,
  Plus,
  Search,
  Settings,
  Table,
  Trash2,
  User,
  Users
} from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    name:
      | 'home'
      | 'apps'
      | 'report'
      | 'settings'
      | 'user'
      | 'logout'
      | 'search'
      | 'notifications'
      | 'table'
      | 'add'
      | 'edit'
      | 'delete'
      | 'view'
      | 'menu'
      | 'chevronDown'
      | 'chevronLeft'
      | 'chevronRight'
      | 'users'
      | 'requests';
    size?: number;
    strokeWidth?: number;
  }>(),
  {
    size: 18,
    strokeWidth: 1.8
  }
);

const iconComponent = computed(() => {
  const map = {
    home: Home,
    apps: LayoutGrid,
    report: FileText,
    settings: Settings,
    user: User,
    logout: LogOut,
    search: Search,
    notifications: Bell,
    table: Table,
    add: Plus,
    edit: Pencil,
    delete: Trash2,
    view: Eye,
    menu: Menu,
    chevronDown: ChevronDown,
    chevronLeft: ChevronLeft,
    chevronRight: ChevronRight,
    users: Users,
    requests: ClipboardList
  };
  return map[props.name] ?? LayoutGrid;
});
</script>
