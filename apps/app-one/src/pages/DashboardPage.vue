<template>
  <PageShell>
    <PageHeader title="نمای کلی" subtitle="خلاصه وضعیت کاربران و درخواست‌ها">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'اپلیکیشن یک' }, { label: 'نمای کلی' }]" />
      </template>
    </PageHeader>
    <div class="grid">
      <div class="card">
        <h3 class="title">کاربران فعال</h3>
        <p class="value">{{ appOneStore.summary.activeUsers }}</p>
        <p class="subtitle">آخرین بروزرسانی امروز</p>
      </div>
      <div class="card">
        <h3 class="title">درخواست‌های در انتظار</h3>
        <p class="value">{{ appOneStore.summary.pendingRequests }}</p>
        <p class="subtitle">نیازمند اقدام فوری</p>
      </div>
      <div class="card">
        <h3 class="title">درخواست‌های تکمیل‌شده</h3>
        <p class="value">{{ appOneStore.summary.resolvedRequests }}</p>
        <p class="subtitle">در ۷ روز اخیر</p>
      </div>
    </div>
    <div class="card">
      <h3 class="title">فعالیت‌های اخیر</h3>
      <ul class="list">
        <li v-for="(item, index) in appOneStore.recentActivity" :key="index">
          {{ item }}
        </li>
      </ul>
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import { useAppOneStore } from '../stores/app-one.store';

const appOneStore = useAppOneStore();
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 16px;
  padding: 16px;
}

.title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.value {
  font-size: 28px;
  font-weight: 700;
  margin: 8px 0;
}

.subtitle {
  font-size: 12px;
  color: var(--color-text-muted);
}

.list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-muted);
}
</style>
