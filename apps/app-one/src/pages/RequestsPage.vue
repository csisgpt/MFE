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
        <input v-model="query" class="input" placeholder="جستجو بر اساس عنوان یا ارجاع" />
        <select v-model="statusFilter" class="input">
          <option value="">همه وضعیت‌ها</option>
          <option value="جدید">جدید</option>
          <option value="در حال بررسی">در حال بررسی</option>
          <option value="انجام شد">انجام شد</option>
          <option value="رد شد">رد شد</option>
        </select>
        <button class="secondary-button" type="button" @click="reload">به‌روزرسانی</button>
      </div>

      <SkeletonBlock v-if="loading && !requests.length" height="120px" />
      <EnterpriseDataGrid
        v-else
        :row-data="requests"
        :column-defs="columns"
        :loading="loading"
        :error="errorMessage"
        :pagination-mode="'server'"
        :page="page"
        :page-size="pageSize"
        :total="total"
        :show-actions="true"
        empty-action-label="ثبت درخواست"
        @row-action="handleAction"
        @page-change="handlePageChange"
        @retry="reload"
        @empty-action="openCreate"
      />
    </div>

    <div v-if="detailOpen" class="overlay" @click.self="detailOpen = false">
      <div class="drawer">
        <div class="drawer-header">
          <h3>جزئیات درخواست</h3>
          <button class="ghost-button" type="button" @click="detailOpen = false">بستن</button>
        </div>
        <div v-if="selectedRequest" class="drawer-body">
          <p>عنوان: {{ selectedRequest.title }}</p>
          <p>کد درخواست: {{ selectedRequest.id }}</p>
          <p>ارجاع به: {{ selectedRequest.assignee }}</p>
          <p>اولویت: {{ selectedRequest.priority }}</p>
          <p>وضعیت: {{ selectedRequest.status }}</p>
          <p>تاریخ ثبت: {{ formatDate(selectedRequest.createdAt) }}</p>
        </div>
      </div>
    </div>

    <div v-if="formOpen" class="overlay" @click.self="closeForm">
      <div class="modal">
        <div class="drawer-header">
          <h3>ثبت درخواست</h3>
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
            ارجاع به
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
          <div class="form-actions">
            <button class="secondary-button" type="button" @click="closeForm">انصراف</button>
            <button class="action-button" type="submit" :disabled="saving">
              {{ saving ? 'در حال ذخیره...' : 'ذخیره' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="statusOpen" class="overlay" @click.self="closeStatus">
      <div class="modal">
        <div class="drawer-header">
          <h3>تغییر وضعیت درخواست</h3>
          <button class="ghost-button" type="button" @click="closeStatus">بستن</button>
        </div>
        <div class="form">
          <label>
            وضعیت جدید
            <select v-model="statusForm">
              <option value="جدید">جدید</option>
              <option value="در حال بررسی">در حال بررسی</option>
              <option value="انجام شد">انجام شد</option>
              <option value="رد شد">رد شد</option>
            </select>
          </label>
        </div>
        <div class="form-actions">
          <button class="secondary-button" type="button" @click="closeStatus">انصراف</button>
          <button class="action-button" type="button" :disabled="saving" @click="confirmStatus">
            {{ saving ? 'در حال ثبت...' : 'ثبت تغییر' }}
          </button>
        </div>
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
import { onMounted, reactive, ref, watch } from 'vue';
import type { ColDef } from 'ag-grid-community';
import type { ServiceRequest } from '@shared/contracts';
import {
  createServiceRequest,
  deleteServiceRequest,
  getServiceRequests,
  updateServiceRequestStatus
} from '@shared/api-client';
import { eventBus } from '@shared/store';
import { usePagedQuery } from '@shared/http';

const query = ref('');
const statusFilter = ref('');
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const requests = ref<ServiceRequest[]>([]);
const selectedRequest = ref<ServiceRequest | null>(null);
const detailOpen = ref(false);
const formOpen = ref(false);
const statusOpen = ref(false);
const confirmDelete = ref<ServiceRequest | null>(null);
const statusForm = ref<ServiceRequest['status']>('جدید');

const { page, pageSize, total, setTotal, setPage } = usePagedQuery(1, 6);

const form = reactive({
  title: '',
  requester: '',
  assignee: '',
  priority: 'متوسط' as ServiceRequest['priority']
});

const columns: ColDef[] = [
  { field: 'title', headerName: 'عنوان' },
  { field: 'id', headerName: 'کد' },
  { field: 'status', headerName: 'وضعیت' },
  { field: 'assignee', headerName: 'ارجاع به' },
  { field: 'createdAt', headerName: 'تاریخ ثبت' }
];

const formatDate = (value?: string) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('fa-IR');
};

const loadRequests = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const response = await getServiceRequests(page.value, pageSize.value, query.value, statusFilter.value);
    requests.value = response.data;
    setTotal(response.total);
  } catch (error) {
    errorMessage.value = 'بارگذاری درخواست‌ها با خطا مواجه شد.';
  } finally {
    loading.value = false;
  }
};

const reload = () => {
  loadRequests();
};

const handlePageChange = ({ page: nextPage, pageSize: nextPageSize }: { page: number; pageSize: number }) => {
  setPage(nextPage);
  if (pageSize.value !== nextPageSize) {
    pageSize.value = nextPageSize;
    setPage(1);
  }
  loadRequests();
};

const openCreate = () => {
  Object.assign(form, {
    title: '',
    requester: '',
    assignee: '',
    priority: 'متوسط'
  });
  formOpen.value = true;
};

const closeForm = () => {
  formOpen.value = false;
};

const openStatus = (request: ServiceRequest) => {
  selectedRequest.value = request;
  statusForm.value = request.status;
  statusOpen.value = true;
};

const closeStatus = () => {
  statusOpen.value = false;
};

const handleAction = (payload: { type: 'view' | 'edit' | 'delete'; row: ServiceRequest }) => {
  selectedRequest.value = payload.row;
  if (payload.type === 'view') {
    detailOpen.value = true;
    return;
  }
  if (payload.type === 'edit') {
    openStatus(payload.row);
    return;
  }
  if (payload.type === 'delete') {
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
      await createServiceRequest({
        ...form,
        status: 'جدید'
      });
      eventBus.emit('TOAST', { type: 'success', message: 'درخواست جدید ثبت شد.' });
      await loadRequests();
    }
    formOpen.value = false;
  } catch (error) {
    eventBus.emit('TOAST', { type: 'error', message: 'ذخیره درخواست ناموفق بود.' });
  } finally {
    saving.value = false;
  }
};

const confirmStatus = async () => {
  if (!selectedRequest.value) return;
  saving.value = true;
  try {
    const updated = await updateServiceRequestStatus(selectedRequest.value.id, statusForm.value);
    requests.value = requests.value.map((item) => (item.id === updated.id ? updated : item));
    eventBus.emit('TOAST', { type: 'success', message: 'وضعیت درخواست تغییر کرد.' });
    statusOpen.value = false;
  } catch (error) {
    eventBus.emit('TOAST', { type: 'error', message: 'ثبت وضعیت ناموفق بود.' });
  } finally {
    saving.value = false;
  }
};

const deleteRequest = async () => {
  if (!confirmDelete.value) return;
  saving.value = true;
  try {
    await deleteServiceRequest(confirmDelete.value.id);
    eventBus.emit('TOAST', { type: 'info', message: 'درخواست حذف شد.' });
    confirmDelete.value = null;
    await loadRequests();
  } catch (error) {
    eventBus.emit('TOAST', { type: 'error', message: 'حذف درخواست ناموفق بود.' });
  } finally {
    saving.value = false;
  }
};

watch([query, statusFilter], () => {
  setPage(1);
  loadRequests();
});

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
  background: var(--color-danger);
  color: var(--color-primary-contrast);
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
  width: min(420px, 90vw);
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
  width: min(520px, 92vw);
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
</style>
