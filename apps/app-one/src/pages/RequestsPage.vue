<template>
  <PageShell>
    <PageHeader title="درخواست‌ها" subtitle="کنترل جریان درخواست‌های داخلی و سطح خدمت">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'اپلیکیشن یک' }, { label: 'درخواست‌ها' }]" />
      </template>
      <template #actions>
        <UiButton type="primary" class="action-primary" @click="openCreate">
          <UiIcon name="add" />
          ثبت درخواست
        </UiButton>
      </template>
    </PageHeader>

    <section class="space-y-4">
      <div class="card">
        <div class="filters">
          <UiInput
            v-model:value="filters.query"
            placeholder="جستجو بر اساس عنوان یا درخواست‌کننده"
          >
            <template #prefix>
              <UiIcon name="search" />
            </template>
          </UiInput>
          <UiSelect v-model:value="filters.status" :options="statusOptions" placeholder="انتخاب وضعیت" />
          <UiSelect v-model:value="filters.priority" :options="priorityOptions" placeholder="انتخاب اولویت" />
          <UiButton class="refresh-button" @click="reload">
            به‌روزرسانی
          </UiButton>
        </div>

        <div v-if="errorMessage" class="error-box">
          <div>
            <div class="font-semibold">اختلال در دریافت درخواست‌ها</div>
            <div class="text-xs text-[var(--color-text-muted)]">{{ errorMessage }}</div>
          </div>
          <UiButton @click="reload">تلاش مجدد</UiButton>
        </div>

        <div v-else class="space-y-4">
          <div v-if="loading && requests.length === 0" class="space-y-3">
            <SkeletonBlock height="24px" />
            <SkeletonBlock height="24px" />
            <SkeletonBlock height="24px" />
            <SkeletonBlock height="24px" />
          </div>
          <EnterpriseDataGrid
            v-else
            :row-data="requests"
            :column-defs="columns"
            :loading="loading"
            :page="page"
            :page-size="pageSize"
            :total="total"
            :quick-filter="filters.query"
            :storage-key="gridStorageKey"
            :show-actions="true"
            @row-action="handleAction"
            @page-change="handlePageChange"
            @pageSize-change="handlePageSizeChange"
          />

          <EmptyState
            v-if="!loading && requests.length === 0"
            title="درخواستی ثبت نشده است"
            description="برای شروع می‌توانید درخواست جدیدی ثبت کنید."
          >
            <UiButton type="primary" class="action-primary" @click="openCreate">
              ثبت درخواست
            </UiButton>
          </EmptyState>
        </div>
      </div>
    </section>

    <UiDrawer
      v-model:open="detailOpen"
      title="جزئیات درخواست"
      placement="right"
      width="420"
    >
      <div v-if="selectedRequest" class="drawer-body">
        <div class="drawer-row">
          <span>عنوان درخواست</span>
          <strong>{{ selectedRequest.title }}</strong>
        </div>
        <div class="drawer-row">
          <span>درخواست‌کننده</span>
          <strong>{{ selectedRequest.requester }}</strong>
        </div>
        <div class="drawer-row">
          <span>مسئول رسیدگی</span>
          <strong>{{ selectedRequest.assignee }}</strong>
        </div>
        <div class="drawer-row">
          <span>اولویت</span>
          <span class="status-pill" :class="priorityClass(selectedRequest.priority)">
            {{ selectedRequest.priority }}
          </span>
        </div>
        <div class="drawer-row">
          <span>وضعیت</span>
          <span class="status-pill" :class="statusClass(selectedRequest.status)">
            {{ selectedRequest.status }}
          </span>
        </div>
        <div class="drawer-row">
          <span>تاریخ ثبت</span>
          <strong>{{ selectedRequest.createdAt }}</strong>
        </div>
      </div>
    </UiDrawer>

    <UiModal v-model:open="formOpen" :title="formTitle" :footer="null">
      <div class="modal-body">
        <div class="form-grid">
          <div>
            <label class="form-label">عنوان درخواست</label>
            <UiInput v-model:value="form.title" placeholder="عنوان درخواست" />
            <span v-if="formErrors.title" class="form-error">{{ formErrors.title }}</span>
          </div>
          <div>
            <label class="form-label">درخواست‌کننده</label>
            <UiInput v-model:value="form.requester" placeholder="نام درخواست‌کننده" />
            <span v-if="formErrors.requester" class="form-error">{{ formErrors.requester }}</span>
          </div>
          <div>
            <label class="form-label">مسئول رسیدگی</label>
            <UiInput v-model:value="form.assignee" placeholder="نام مسئول" />
            <span v-if="formErrors.assignee" class="form-error">{{ formErrors.assignee }}</span>
          </div>
          <div>
            <label class="form-label">اولویت</label>
            <UiSelect
              v-model:value="form.priority"
              :options="priorityOptions.filter((opt) => opt.value !== 'all')"
              placeholder="انتخاب اولویت"
            />
          </div>
          <div>
            <label class="form-label">وضعیت</label>
            <UiSelect
              v-model:value="form.status"
              :options="statusOptions.filter((opt) => opt.value !== 'all')"
              placeholder="انتخاب وضعیت"
            />
          </div>
        </div>
        <div class="form-actions">
          <UiButton @click="closeForm">انصراف</UiButton>
          <UiButton type="primary" :loading="saving" @click="submitForm">
            {{ saving ? 'در حال ذخیره...' : 'ثبت اطلاعات' }}
          </UiButton>
        </div>
      </div>
    </UiModal>

    <UiModal v-model:open="confirmOpen" title="حذف درخواست" :footer="null">
      <div class="modal-body">
        <p class="text-sm text-[var(--color-text-muted)]">
          آیا از حذف درخواست «{{ confirmDelete?.title }}» اطمینان دارید؟ این عملیات قابل بازگشت نیست.
        </p>
        <div class="form-actions">
          <UiButton @click="confirmOpen = false">لغو</UiButton>
          <UiButton type="primary" danger :loading="saving" @click="deleteRequest">
            {{ saving ? 'در حال حذف...' : 'حذف درخواست' }}
          </UiButton>
        </div>
      </div>
    </UiModal>
  </PageShell>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import type { ColDef } from 'ag-grid-community';
import type { ServiceRequest } from '@shared/contracts';
import {
  createServiceRequest,
  deleteServiceRequest,
  getServiceRequests,
  updateServiceRequest
} from '@shared/api-client';
import { eventBus } from '@shared/store';
import { StatusBadgeRenderer } from '@shared/ui';

const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const requests = ref<ServiceRequest[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(6);
const selectedRequest = ref<ServiceRequest | null>(null);
const detailOpen = ref(false);
const formOpen = ref(false);
const confirmOpen = ref(false);
const confirmDelete = ref<ServiceRequest | null>(null);
const editingRequest = ref<ServiceRequest | null>(null);
const gridStorageKey = 'app-one-requests-grid';

const filters = reactive({
  query: '',
  status: 'all' as 'all' | ServiceRequest['status'],
  priority: 'all' as 'all' | ServiceRequest['priority']
});

const statusOptions = [
  { value: 'all', label: 'همه وضعیت‌ها' },
  { value: 'در انتظار', label: 'در انتظار' },
  { value: 'در حال انجام', label: 'در حال انجام' },
  { value: 'تکمیل‌شده', label: 'تکمیل‌شده' },
  { value: 'لغو شده', label: 'لغو شده' }
];

const priorityOptions = [
  { value: 'all', label: 'همه اولویت‌ها' },
  { value: 'بالا', label: 'بالا' },
  { value: 'متوسط', label: 'متوسط' },
  { value: 'کم', label: 'کم' }
];

const columns = computed<ColDef[]>(() => [
  { field: 'title', headerName: 'عنوان', minWidth: 200 },
  { field: 'requester', headerName: 'درخواست‌کننده', minWidth: 160 },
  { field: 'assignee', headerName: 'مسئول', minWidth: 150 },
  {
    field: 'priority',
    headerName: 'اولویت',
    cellRenderer: StatusBadgeRenderer,
    minWidth: 120
  },
  {
    field: 'status',
    headerName: 'وضعیت',
    cellRenderer: StatusBadgeRenderer,
    minWidth: 140
  },
  { field: 'createdAt', headerName: 'تاریخ ثبت', minWidth: 120 }
]);

const form = reactive({
  title: '',
  requester: '',
  assignee: '',
  priority: 'متوسط' as ServiceRequest['priority'],
  status: 'در انتظار' as ServiceRequest['status']
});

const formErrors = reactive({
  title: '',
  requester: '',
  assignee: ''
});

const formTitle = computed(() => (editingRequest.value ? 'ویرایش درخواست' : 'ثبت درخواست'));

const loadRequests = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const response = await getServiceRequests({
      page: page.value,
      pageSize: pageSize.value,
      query: filters.query,
      status: filters.status,
      priority: filters.priority
    });
    requests.value = response.data;
    total.value = response.total;
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
  Object.assign(formErrors, {
    title: '',
    requester: '',
    assignee: ''
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
    confirmOpen.value = true;
  }
};

const validateForm = () => {
  formErrors.title = form.title.trim() ? '' : 'عنوان درخواست را وارد کنید.';
  formErrors.requester = form.requester.trim() ? '' : 'نام درخواست‌کننده را وارد کنید.';
  formErrors.assignee = form.assignee.trim() ? '' : 'نام مسئول رسیدگی را وارد کنید.';
  return !formErrors.title && !formErrors.requester && !formErrors.assignee;
};

const submitForm = async () => {
  if (!validateForm()) return;
  saving.value = true;
  try {
    if (editingRequest.value) {
      const updated = await updateServiceRequest(editingRequest.value.id, form);
      requests.value = requests.value.map((item) => (item.id === updated.id ? updated : item));
      eventBus.emit('TOAST', { type: 'success', message: 'درخواست به‌روزرسانی شد.' });
    } else {
      await createServiceRequest(form);
      eventBus.emit('TOAST', { type: 'success', message: 'درخواست جدید ثبت شد.' });
      page.value = 1;
    }
    formOpen.value = false;
    await loadRequests();
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
    eventBus.emit('TOAST', { type: 'info', message: 'درخواست حذف شد.' });
    confirmOpen.value = false;
    page.value = 1;
    await loadRequests();
  } catch (error) {
    eventBus.emit('TOAST', { type: 'error', message: 'حذف درخواست ناموفق بود.' });
  } finally {
    saving.value = false;
  }
};

const handlePageChange = (nextPage: number) => {
  page.value = nextPage;
  loadRequests();
};

const handlePageSizeChange = (nextSize: number) => {
  pageSize.value = nextSize;
  page.value = 1;
  loadRequests();
};

const statusClass = (status: ServiceRequest['status']) => {
  switch (status) {
    case 'تکمیل‌شده':
      return 'status-success';
    case 'در انتظار':
      return 'status-warning';
    case 'در حال انجام':
      return 'status-info';
    case 'لغو شده':
      return 'status-danger';
    default:
      return 'status-muted';
  }
};

const priorityClass = (priority: ServiceRequest['priority']) => {
  switch (priority) {
    case 'بالا':
      return 'status-danger';
    case 'متوسط':
      return 'status-warning';
    case 'کم':
      return 'status-success';
    default:
      return 'status-muted';
  }
};

watch(
  () => [filters.query, filters.status, filters.priority],
  () => {
    page.value = 1;
    loadRequests();
  }
);

onMounted(() => {
  loadRequests();
});
</script>

<style scoped>
.card {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  border-radius: 20px;
  padding: 16px;
}

.filters {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  align-items: center;
}

.action-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.refresh-button {
  width: 100%;
}

.error-box {
  border: 1px solid var(--color-danger);
  background: var(--color-danger-soft);
  border-radius: 16px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.drawer-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drawer-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
}

.drawer-row span {
  color: var(--color-text-muted);
}

.status-pill {
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
}

.status-success {
  background: var(--color-success-soft);
  color: var(--color-success);
  border-color: var(--color-success);
}

.status-warning {
  background: var(--color-warning-soft);
  color: var(--color-warning);
  border-color: var(--color-warning);
}

.status-info {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.status-danger {
  background: var(--color-danger-soft);
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.status-muted {
  background: var(--color-surface-muted);
  color: var(--color-text-muted);
  border-color: var(--color-border);
}

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.form-error {
  display: block;
  margin-top: 6px;
  font-size: 11px;
  color: var(--color-danger);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 768px) {
  .refresh-button {
    width: auto;
  }
}
</style>
