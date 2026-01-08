<template>
  <PageShell>
    <PageHeader title="درخواست‌ها" subtitle="پیگیری درخواست‌های داخلی و تیکت‌ها">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'اپلیکیشن یک' }, { label: 'درخواست‌ها' }]" />
      </template>
      <template #actions>
        <button class="action-button" type="button" @click="openCreate">ثبت درخواست</button>
      </template>
    </PageHeader>

    <div class="card space-y-4">
      <div class="filters">
        <input v-model="query" class="input" placeholder="جستجو بر اساس عنوان یا درخواست‌کننده" />
        <select v-model="statusFilter" class="input">
          <option value="all">همه وضعیت‌ها</option>
          <option value="در انتظار">در انتظار</option>
          <option value="در حال انجام">در حال انجام</option>
          <option value="تکمیل‌شده">تکمیل‌شده</option>
          <option value="لغو شده">لغو شده</option>
        </select>
        <button class="secondary-button" type="button" @click="reload">به‌روزرسانی</button>
      </div>

      <EnterpriseDataGrid
        v-if="!errorMessage"
        :row-data="filteredRequests"
        :column-defs="columns"
        :loading="loading"
        :pagination-page-size="6"
        :show-actions="true"
        @row-action="handleAction"
      />
      <div v-else class="error-box">
        <p>{{ errorMessage }}</p>
        <button class="secondary-button" type="button" @click="reload">تلاش مجدد</button>
      </div>
      <EmptyState
        v-if="!loading && !errorMessage && filteredRequests.length === 0"
        title="درخواستی ثبت نشده است"
        description="برای شروع می‌توانید درخواست جدیدی ثبت کنید."
      >
        <button class="action-button" type="button" @click="openCreate">ثبت درخواست</button>
      </EmptyState>
    </div>

    <div v-if="detailOpen" class="overlay" @click.self="detailOpen = false">
      <div class="drawer">
        <div class="drawer-header">
          <h3>جزئیات درخواست</h3>
          <button class="ghost-button" type="button" @click="detailOpen = false">بستن</button>
        </div>
        <div v-if="selectedRequest" class="drawer-body">
          <p>عنوان: {{ selectedRequest.title }}</p>
          <p>درخواست‌کننده: {{ selectedRequest.requester }}</p>
          <p>مسئول: {{ selectedRequest.assignee }}</p>
          <p>اولویت: {{ selectedRequest.priority }}</p>
          <p>وضعیت: {{ selectedRequest.status }}</p>
          <p>تاریخ ثبت: {{ selectedRequest.createdAt }}</p>
        </div>
      </div>
    </div>

    <div v-if="formOpen" class="overlay" @click.self="closeForm">
      <div class="modal">
        <div class="drawer-header">
          <h3>{{ editingRequest ? 'ویرایش درخواست' : 'ثبت درخواست' }}</h3>
          <button class="ghost-button" type="button" @click="closeForm">بستن</button>
        </div>
        <form class="form" @submit.prevent="submitForm">
          <label>
            عنوان درخواست
            <input v-model="form.title" required />
          </label>
          <label>
            درخواست‌کننده
            <input v-model="form.requester" required />
          </label>
          <label>
            مسئول رسیدگی
            <input v-model="form.assignee" required />
          </label>
          <label>
            اولویت
            <select v-model="form.priority">
              <option value="بالا">بالا</option>
              <option value="متوسط">متوسط</option>
              <option value="کم">کم</option>
            </select>
          </label>
          <label>
            وضعیت
            <select v-model="form.status">
              <option value="در انتظار">در انتظار</option>
              <option value="در حال انجام">در حال انجام</option>
              <option value="تکمیل‌شده">تکمیل‌شده</option>
              <option value="لغو شده">لغو شده</option>
            </select>
          </label>
          <div class="form-actions">
            <button class="secondary-button" type="button" @click="closeForm">انصراف</button>
            <button class="action-button" type="submit" :disabled="saving">
              {{ saving ? 'در حال ذخیره...' : 'ذخیره' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="confirmDelete" class="overlay" @click.self="confirmDelete = null">
      <div class="modal">
        <div class="drawer-header">
          <h3>حذف درخواست</h3>
          <button class="ghost-button" type="button" @click="confirmDelete = null">بستن</button>
        </div>
        <p>آیا از حذف درخواست «{{ confirmDelete?.title }}» اطمینان دارید؟</p>
        <div class="form-actions">
          <button class="secondary-button" type="button" @click="confirmDelete = null">لغو</button>
          <button class="danger-button" type="button" :disabled="saving" @click="deleteRequest">
            {{ saving ? 'در حال حذف...' : 'حذف' }}
          </button>
        </div>
      </div>
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import type { ColDef } from 'ag-grid-community';
import type { ServiceRequest } from '@shared/contracts';
import {
  createServiceRequest,
  deleteServiceRequest,
  getServiceRequests,
  updateServiceRequest
} from '@shared/api-client';
import { eventBus } from '@shared/store';

const query = ref('');
const statusFilter = ref<'all' | ServiceRequest['status']>('all');
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const requests = ref<ServiceRequest[]>([]);
const selectedRequest = ref<ServiceRequest | null>(null);
const detailOpen = ref(false);
const formOpen = ref(false);
const confirmDelete = ref<ServiceRequest | null>(null);
const editingRequest = ref<ServiceRequest | null>(null);

const form = reactive({
  title: '',
  requester: '',
  assignee: '',
  priority: 'متوسط' as ServiceRequest['priority'],
  status: 'در انتظار' as ServiceRequest['status']
});

const columns: ColDef[] = [
  { field: 'title', headerName: 'عنوان' },
  { field: 'requester', headerName: 'درخواست‌کننده' },
  { field: 'assignee', headerName: 'مسئول' },
  { field: 'priority', headerName: 'اولویت' },
  { field: 'status', headerName: 'وضعیت' },
  { field: 'createdAt', headerName: 'تاریخ ثبت' }
];

const filteredRequests = computed(() =>
  requests.value.filter((request) => {
    const matchesQuery =
      request.title.includes(query.value) || request.requester.includes(query.value);
    const matchesStatus = statusFilter.value === 'all' || request.status === statusFilter.value;
    return matchesQuery && matchesStatus;
  })
);

const loadRequests = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const response = await getServiceRequests(1, 20);
    requests.value = response.data;
  } catch (error) {
    errorMessage.value = 'بارگذاری درخواست‌ها با خطا مواجه شد.';
  } finally {
    loading.value = false;
  }
};

const reload = () => {
  loadRequests();
};

const openCreate = () => {
  editingRequest.value = null;
  Object.assign(form, {
    title: '',
    requester: '',
    assignee: '',
    priority: 'متوسط',
    status: 'در انتظار'
  });
  formOpen.value = true;
};

const closeForm = () => {
  formOpen.value = false;
};

const handleAction = (payload: { action: 'view' | 'edit' | 'delete'; row: ServiceRequest }) => {
  selectedRequest.value = payload.row;
  if (payload.action === 'view') {
    detailOpen.value = true;
    return;
  }
  if (payload.action === 'edit') {
    editingRequest.value = payload.row;
    Object.assign(form, {
      title: payload.row.title,
      requester: payload.row.requester,
      assignee: payload.row.assignee,
      priority: payload.row.priority,
      status: payload.row.status
    });
    formOpen.value = true;
    return;
  }
  if (payload.action === 'delete') {
    confirmDelete.value = payload.row;
  }
};

const submitForm = async () => {
  saving.value = true;
  try {
    if (editingRequest.value) {
      const updated = await updateServiceRequest(editingRequest.value.id, form);
      requests.value = requests.value.map((item) => (item.id === updated.id ? updated : item));
      eventBus.emit('TOAST', { type: 'success', message: 'درخواست به‌روزرسانی شد.' });
    } else {
      const created = await createServiceRequest({
        ...form,
        createdAt: new Date().toLocaleDateString('fa-IR')
      });
      requests.value = [created, ...requests.value];
      eventBus.emit('TOAST', { type: 'success', message: 'درخواست جدید ثبت شد.' });
    }
    formOpen.value = false;
  } catch (error) {
    eventBus.emit('TOAST', { type: 'error', message: 'ذخیره درخواست ناموفق بود.' });
  } finally {
    saving.value = false;
  }
};

const deleteRequest = async () => {
  if (!confirmDelete.value) return;
  saving.value = true;
  try {
    await deleteServiceRequest(confirmDelete.value.id);
    requests.value = requests.value.filter((item) => item.id !== confirmDelete.value?.id);
    eventBus.emit('TOAST', { type: 'info', message: 'درخواست حذف شد.' });
    confirmDelete.value = null;
  } catch (error) {
    eventBus.emit('TOAST', { type: 'error', message: 'حذف درخواست ناموفق بود.' });
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadRequests();
});
</script>

<style scoped>
.card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 16px;
  padding: 16px;
}

.filters {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.input {
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.action-button {
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
}

.secondary-button {
  background: var(--color-surface-muted);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  padding: 8px 16px;
  border-radius: 12px;
}

.danger-button {
  background: #dc2626;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 16px;
}

.drawer {
  background: var(--color-surface);
  width: min(400px, 90vw);
  border-radius: 16px;
  padding: 16px;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.drawer-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
}

.modal {
  background: var(--color-surface);
  width: min(500px, 92vw);
  border-radius: 16px;
  padding: 16px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.ghost-button {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
}

.error-box {
  border: 1px solid rgba(220, 38, 38, 0.4);
  background: rgba(248, 113, 113, 0.1);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
