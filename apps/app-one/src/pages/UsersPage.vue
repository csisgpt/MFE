<template>
  <PageShell>
    <PageHeader title="کاربران" subtitle="مدیریت چرخه کامل پرسنل و نقش‌های سازمانی">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'اپلیکیشن یک' }, { label: 'کاربران' }]" />
      </template>
      <template #actions>
        <UiButton type="primary" class="action-primary" @click="openCreate">
          <UiIcon name="add" />
          افزودن کاربر
        </UiButton>
      </template>
    </PageHeader>

    <section class="space-y-4">
      <div class="card">
        <div class="filters">
          <UiInput
            v-model:value="filters.query"
            placeholder="جستجو بر اساس نام، واحد یا نقش"
          >
            <template #prefix>
              <UiIcon name="search" />
            </template>
          </UiInput>
          <UiSelect v-model:value="filters.status" :options="statusOptions" placeholder="انتخاب وضعیت" />
          <UiSelect v-model:value="filters.role" :options="roleOptions" placeholder="انتخاب نقش" />
          <UiButton class="refresh-button" @click="reload">
            به‌روزرسانی
          </UiButton>
        </div>

        <div v-if="errorMessage" class="error-box">
          <div>
            <div class="font-semibold">اختلال در دریافت کاربران</div>
            <div class="text-xs text-[var(--color-text-muted)]">{{ errorMessage }}</div>
          </div>
          <UiButton @click="reload">تلاش مجدد</UiButton>
        </div>

        <div v-else class="space-y-4">
          <div v-if="loading && users.length === 0" class="space-y-3">
            <SkeletonBlock height="24px" />
            <SkeletonBlock height="24px" />
            <SkeletonBlock height="24px" />
            <SkeletonBlock height="24px" />
          </div>
          <EnterpriseDataGrid
            v-else
            :row-data="users"
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
            v-if="!loading && users.length === 0"
            title="کاربری ثبت نشده است"
            description="برای شروع، یک کاربر سازمانی اضافه کنید."
          >
            <UiButton type="primary" class="action-primary" @click="openCreate">
              افزودن کاربر
            </UiButton>
          </EmptyState>
        </div>
      </div>
    </section>

    <UiDrawer
      v-model:open="detailOpen"
      title="جزئیات کاربر"
      placement="right"
      width="420"
    >
      <div v-if="selectedUser" class="drawer-body">
        <div class="drawer-row">
          <span>نام و نام خانوادگی</span>
          <strong>{{ selectedUser.fullName }}</strong>
        </div>
        <div class="drawer-row">
          <span>واحد سازمانی</span>
          <strong>{{ selectedUser.department }}</strong>
        </div>
        <div class="drawer-row">
          <span>نقش</span>
          <strong>{{ selectedUser.role }}</strong>
        </div>
        <div class="drawer-row">
          <span>وضعیت</span>
          <span class="status-pill" :class="statusClass(selectedUser.status)">
            {{ selectedUser.status }}
          </span>
        </div>
        <div class="drawer-row">
          <span>شماره تماس</span>
          <strong>{{ selectedUser.phone }}</strong>
        </div>
        <div class="drawer-row">
          <span>تاریخ ثبت</span>
          <strong>{{ selectedUser.createdAt }}</strong>
        </div>
      </div>
    </UiDrawer>

    <UiModal v-model:open="formOpen" :title="formTitle" :footer="null">
      <div class="modal-body">
        <div class="form-grid">
          <div>
            <label class="form-label">نام و نام خانوادگی</label>
            <UiInput v-model:value="form.fullName" placeholder="نام کامل کاربر" />
            <span v-if="formErrors.fullName" class="form-error">{{ formErrors.fullName }}</span>
          </div>
          <div>
            <label class="form-label">واحد سازمانی</label>
            <UiInput v-model:value="form.department" placeholder="مثلاً فناوری اطلاعات" />
            <span v-if="formErrors.department" class="form-error">{{ formErrors.department }}</span>
          </div>
          <div>
            <label class="form-label">نقش سازمانی</label>
            <UiInput v-model:value="form.role" placeholder="عنوان نقش" />
            <span v-if="formErrors.role" class="form-error">{{ formErrors.role }}</span>
          </div>
          <div>
            <label class="form-label">وضعیت</label>
            <UiSelect
              v-model:value="form.status"
              :options="statusOptions.filter((opt) => opt.value !== 'all')"
              placeholder="انتخاب وضعیت"
            />
          </div>
          <div>
            <label class="form-label">شماره تماس</label>
            <UiInput v-model:value="form.phone" placeholder="شماره تماس" />
            <span v-if="formErrors.phone" class="form-error">{{ formErrors.phone }}</span>
          </div>
        </div>
        <div class="form-actions">
          <UiButton @click="closeForm">انصراف</UiButton>
          <UiButton type="primary" :loading="saving" @click="submitForm">
            {{ saving ? 'در حال ذخیره...' : 'ذخیره اطلاعات' }}
          </UiButton>
        </div>
      </div>
    </UiModal>

    <UiModal v-model:open="confirmOpen" title="حذف کاربر" :footer="null">
      <div class="modal-body">
        <p class="text-sm text-[var(--color-text-muted)]">
          آیا از حذف کاربر «{{ confirmDelete?.fullName }}» اطمینان دارید؟ این عملیات قابل بازگشت نیست.
        </p>
        <div class="form-actions">
          <UiButton @click="confirmOpen = false">لغو</UiButton>
          <UiButton type="primary" danger :loading="saving" @click="deleteUser">
            {{ saving ? 'در حال حذف...' : 'حذف کاربر' }}
          </UiButton>
        </div>
      </div>
    </UiModal>
  </PageShell>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import type { ColDef } from 'ag-grid-community';
import type { PersonnelUser } from '@shared/contracts';
import {
  createPersonnelUser,
  deletePersonnelUser,
  getPersonnelUsers,
  updatePersonnelUser
} from '@shared/api-client';
import { eventBus } from '@shared/store';
import { StatusBadgeRenderer } from '@shared/ui';

const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const users = ref<PersonnelUser[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(6);
const selectedUser = ref<PersonnelUser | null>(null);
const detailOpen = ref(false);
const formOpen = ref(false);
const confirmOpen = ref(false);
const confirmDelete = ref<PersonnelUser | null>(null);
const editingUser = ref<PersonnelUser | null>(null);
const gridStorageKey = 'app-one-users-grid';

const filters = reactive({
  query: '',
  status: 'all' as 'all' | PersonnelUser['status'],
  role: 'all'
});

const statusOptions = [
  { value: 'all', label: 'همه وضعیت‌ها' },
  { value: 'فعال', label: 'فعال' },
  { value: 'غیرفعال', label: 'غیرفعال' },
  { value: 'تعلیق', label: 'تعلیق' }
];

const roleOptions = [
  { value: 'all', label: 'همه نقش‌ها' },
  { value: 'کارشناس ارشد', label: 'کارشناس ارشد' },
  { value: 'مدیر سیستم', label: 'مدیر سیستم' },
  { value: 'سرپرست تیم', label: 'سرپرست تیم' },
  { value: 'تحلیل‌گر', label: 'تحلیل‌گر' },
  { value: 'کارشناس پشتیبانی', label: 'کارشناس پشتیبانی' },
  { value: 'مسئول جذب', label: 'مسئول جذب' },
  { value: 'کارشناس امنیت', label: 'کارشناس امنیت' },
  { value: 'کارشناس عملیات', label: 'کارشناس عملیات' },
  { value: 'حسابرس داخلی', label: 'حسابرس داخلی' },
  { value: 'کارشناس قراردادها', label: 'کارشناس قراردادها' },
  { value: 'تحلیل‌گر بازار', label: 'تحلیل‌گر بازار' },
  { value: 'سرپرست شیفت', label: 'سرپرست شیفت' }
];

const columns = computed<ColDef[]>(() => [
  { field: 'fullName', headerName: 'نام و نام خانوادگی', minWidth: 180 },
  { field: 'department', headerName: 'واحد سازمانی', minWidth: 160 },
  { field: 'role', headerName: 'نقش', minWidth: 140 },
  {
    field: 'status',
    headerName: 'وضعیت',
    cellRenderer: StatusBadgeRenderer,
    minWidth: 120
  },
  { field: 'phone', headerName: 'شماره تماس', minWidth: 150 },
  { field: 'createdAt', headerName: 'تاریخ ثبت', minWidth: 120 }
]);

const form = reactive({
  fullName: '',
  department: '',
  role: '',
  status: 'فعال' as PersonnelUser['status'],
  phone: ''
});

const formErrors = reactive({
  fullName: '',
  department: '',
  role: '',
  phone: ''
});

const formTitle = computed(() => (editingUser.value ? 'ویرایش کاربر' : 'افزودن کاربر'));

const loadUsers = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const response = await getPersonnelUsers({
      page: page.value,
      pageSize: pageSize.value,
      query: filters.query,
      status: filters.status,
      role: filters.role
    });
    users.value = response.data;
    total.value = response.total;
  } catch (error) {
    errorMessage.value = 'بارگذاری کاربران با خطا مواجه شد.';
  } finally {
    loading.value = false;
  }
};

const reload = () => {
  loadUsers();
};

const openCreate = () => {
  editingUser.value = null;
  Object.assign(form, {
    fullName: '',
    department: '',
    role: '',
    status: 'فعال',
    phone: ''
  });
  Object.assign(formErrors, {
    fullName: '',
    department: '',
    role: '',
    phone: ''
  });
  formOpen.value = true;
};

const closeForm = () => {
  formOpen.value = false;
};

const handleAction = (payload: { action: 'view' | 'edit' | 'delete'; row: PersonnelUser }) => {
  selectedUser.value = payload.row;
  if (payload.action === 'view') {
    detailOpen.value = true;
    return;
  }
  if (payload.action === 'edit') {
    editingUser.value = payload.row;
    Object.assign(form, {
      fullName: payload.row.fullName,
      department: payload.row.department,
      role: payload.row.role,
      status: payload.row.status,
      phone: payload.row.phone
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
  formErrors.fullName = form.fullName.trim() ? '' : 'نام را وارد کنید.';
  formErrors.department = form.department.trim() ? '' : 'واحد سازمانی را وارد کنید.';
  formErrors.role = form.role.trim() ? '' : 'نقش سازمانی را وارد کنید.';
  formErrors.phone = form.phone.trim() ? '' : 'شماره تماس را وارد کنید.';
  return !formErrors.fullName && !formErrors.department && !formErrors.role && !formErrors.phone;
};

const submitForm = async () => {
  if (!validateForm()) return;
  saving.value = true;
  try {
    if (editingUser.value) {
      const updated = await updatePersonnelUser(editingUser.value.id, form);
      users.value = users.value.map((item) => (item.id === updated.id ? updated : item));
      eventBus.emit('TOAST', { type: 'success', message: 'اطلاعات کاربر به‌روزرسانی شد.' });
    } else {
      await createPersonnelUser(form);
      eventBus.emit('TOAST', { type: 'success', message: 'کاربر جدید ثبت شد.' });
      page.value = 1;
    }
    formOpen.value = false;
    await loadUsers();
  } catch (error) {
    eventBus.emit('TOAST', { type: 'error', message: 'ذخیره اطلاعات ناموفق بود.' });
  } finally {
    saving.value = false;
  }
};

const deleteUser = async () => {
  if (!confirmDelete.value) return;
  saving.value = true;
  try {
    await deletePersonnelUser(confirmDelete.value.id);
    eventBus.emit('TOAST', { type: 'info', message: 'کاربر حذف شد.' });
    confirmOpen.value = false;
    page.value = 1;
    await loadUsers();
  } catch (error) {
    eventBus.emit('TOAST', { type: 'error', message: 'حذف کاربر ناموفق بود.' });
  } finally {
    saving.value = false;
  }
};

const handlePageChange = (nextPage: number) => {
  page.value = nextPage;
  loadUsers();
};

const handlePageSizeChange = (nextSize: number) => {
  pageSize.value = nextSize;
  page.value = 1;
  loadUsers();
};

const statusClass = (status: PersonnelUser['status']) => {
  switch (status) {
    case 'فعال':
      return 'status-success';
    case 'غیرفعال':
      return 'status-muted';
    case 'تعلیق':
      return 'status-danger';
    default:
      return 'status-muted';
  }
};

watch(
  () => [filters.query, filters.status, filters.role],
  () => {
    page.value = 1;
    loadUsers();
  }
);

onMounted(() => {
  loadUsers();
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

.status-muted {
  background: var(--color-surface-muted);
  color: var(--color-text-muted);
  border-color: var(--color-border);
}

.status-danger {
  background: var(--color-danger-soft);
  color: var(--color-danger);
  border-color: var(--color-danger);
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
