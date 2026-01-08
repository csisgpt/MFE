<template>
  <PageShell>
    <PageHeader title="کاربران" subtitle="مدیریت کاربران و پرسنل سازمان">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'اپلیکیشن یک' }, { label: 'کاربران' }]" />
      </template>
      <template #actions>
        <button class="action-button" type="button" @click="openCreate">افزودن کاربر</button>
      </template>
    </PageHeader>

    <div class="card space-y-4">
      <div class="filters">
        <input v-model="query" class="input" placeholder="جستجو بر اساس نام یا واحد" />
        <select v-model="statusFilter" class="input">
          <option value="">همه وضعیت‌ها</option>
          <option value="فعال">فعال</option>
          <option value="غیرفعال">غیرفعال</option>
          <option value="تعلیق">تعلیق</option>
        </select>
        <select v-model="roleFilter" class="input">
          <option value="">همه نقش‌ها</option>
          <option value="مدیر سیستم">مدیر سیستم</option>
          <option value="کارشناس ارشد">کارشناس ارشد</option>
          <option value="کارشناس">کارشناس</option>
          <option value="سرپرست تیم">سرپرست تیم</option>
          <option value="تحلیل‌گر">تحلیل‌گر</option>
          <option value="کارشناس پشتیبانی">کارشناس پشتیبانی</option>
        </select>
        <button class="secondary-button" type="button" @click="reload">به‌روزرسانی</button>
      </div>

      <SkeletonBlock v-if="loading && !users.length" height="120px" />
      <EnterpriseDataGrid
        v-else
        :row-data="users"
        :column-defs="columns"
        :loading="loading"
        :error="errorMessage"
        :pagination-mode="'server'"
        :page="page"
        :page-size="pageSize"
        :total="total"
        :show-actions="true"
        empty-action-label="افزودن کاربر"
        @row-action="handleAction"
        @page-change="handlePageChange"
        @retry="reload"
        @empty-action="openCreate"
      />
    </div>

    <div v-if="detailOpen" class="overlay" @click.self="detailOpen = false">
      <div class="drawer">
        <div class="drawer-header">
          <h3>جزئیات کاربر</h3>
          <button class="ghost-button" type="button" @click="detailOpen = false">بستن</button>
        </div>
        <div v-if="selectedUser" class="drawer-body">
          <p>نام: {{ selectedUser.fullName }}</p>
          <p>نام کاربری: {{ selectedUser.username }}</p>
          <p>کد پرسنلی: {{ selectedUser.id }}</p>
          <p>واحد: {{ selectedUser.department }}</p>
          <p>نقش: {{ selectedUser.role }}</p>
          <p>وضعیت: {{ selectedUser.status }}</p>
          <p>شماره تماس: {{ selectedUser.phone }}</p>
          <p>تاریخ ثبت: {{ formatDate(selectedUser.createdAt) }}</p>
        </div>
      </div>
    </div>

    <div v-if="formOpen" class="overlay" @click.self="closeForm">
      <div class="modal">
        <div class="drawer-header">
          <h3>{{ editingUser ? 'ویرایش کاربر' : 'افزودن کاربر' }}</h3>
          <button class="ghost-button" type="button" @click="closeForm">بستن</button>
        </div>
        <form class="form" @submit.prevent="submitForm">
          <label>
            نام و نام خانوادگی
            <input v-model="form.fullName" required />
          </label>
          <label>
            نام کاربری
            <input v-model="form.username" required />
          </label>
          <label>
            واحد سازمانی
            <input v-model="form.department" required />
          </label>
          <label>
            نقش سازمانی
            <input v-model="form.role" required />
          </label>
          <label>
            وضعیت
            <select v-model="form.status">
              <option value="فعال">فعال</option>
              <option value="غیرفعال">غیرفعال</option>
              <option value="تعلیق">تعلیق</option>
            </select>
          </label>
          <label>
            شماره تماس
            <input v-model="form.phone" required />
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
          <h3>حذف کاربر</h3>
          <button class="ghost-button" type="button" @click="confirmDelete = null">بستن</button>
        </div>
        <p>آیا از حذف کاربر {{ confirmDelete?.fullName }} اطمینان دارید؟</p>
        <div class="form-actions">
          <button class="secondary-button" type="button" @click="confirmDelete = null">لغو</button>
          <button class="danger-button" type="button" :disabled="saving" @click="deleteUser">
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
import type { PersonnelUser } from '@shared/contracts';
import {
  createPersonnelUser,
  deletePersonnelUser,
  getPersonnelUsers,
  updatePersonnelUser
} from '@shared/api-client';
import { eventBus } from '@shared/store';
import { usePagedQuery } from '@shared/http';

const query = ref('');
const statusFilter = ref('');
const roleFilter = ref('');
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const users = ref<PersonnelUser[]>([]);
const selectedUser = ref<PersonnelUser | null>(null);
const detailOpen = ref(false);
const formOpen = ref(false);
const confirmDelete = ref<PersonnelUser | null>(null);
const editingUser = ref<PersonnelUser | null>(null);

const { page, pageSize, total, setTotal, setPage, setPageSize } = usePagedQuery(1, 6);

const form = reactive({
  username: '',
  fullName: '',
  department: '',
  role: '',
  status: 'فعال' as PersonnelUser['status'],
  phone: ''
});

const columns: ColDef[] = [
  { field: 'fullName', headerName: 'نام و نام خانوادگی' },
  { field: 'username', headerName: 'نام کاربری' },
  { field: 'id', headerName: 'کد' },
  { field: 'role', headerName: 'نقش' },
  { field: 'status', headerName: 'وضعیت' },
  { field: 'createdAt', headerName: 'تاریخ ایجاد' }
];

const formatDate = (value?: string) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('fa-IR');
};

const loadUsers = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const response = await getPersonnelUsers(
      page.value,
      pageSize.value,
      query.value,
      statusFilter.value,
      roleFilter.value
    );
    users.value = response.data;
    setTotal(response.total);
  } catch (error) {
    errorMessage.value = 'بارگذاری کاربران با خطا مواجه شد.';
  } finally {
    loading.value = false;
  }
};

const reload = () => {
  loadUsers();
};

const handlePageChange = ({ page: nextPage, pageSize: nextPageSize }: { page: number; pageSize: number }) => {
  setPage(nextPage);
  if (pageSize.value !== nextPageSize) {
    setPageSize(nextPageSize);
  }
  loadUsers();
};

const openCreate = () => {
  editingUser.value = null;
  Object.assign(form, {
    username: '',
    fullName: '',
    department: '',
    role: '',
    status: 'فعال',
    phone: ''
  });
  formOpen.value = true;
};

const closeForm = () => {
  formOpen.value = false;
};

const handleAction = (payload: { type: 'view' | 'edit' | 'delete'; row: PersonnelUser }) => {
  selectedUser.value = payload.row;
  if (payload.type === 'view') {
    detailOpen.value = true;
    return;
  }
  if (payload.type === 'edit') {
    editingUser.value = payload.row;
    Object.assign(form, {
      username: payload.row.username,
      fullName: payload.row.fullName,
      department: payload.row.department,
      role: payload.row.role,
      status: payload.row.status,
      phone: payload.row.phone
    });
    formOpen.value = true;
    return;
  }
  if (payload.type === 'delete') {
    confirmDelete.value = payload.row;
  }
};

const submitForm = async () => {
  saving.value = true;
  try {
    if (editingUser.value) {
      const updated = await updatePersonnelUser(editingUser.value.id, form);
      users.value = users.value.map((item) => (item.id === updated.id ? updated : item));
      eventBus.emit('TOAST', { type: 'success', message: 'کاربر با موفقیت ویرایش شد.' });
    } else {
      await createPersonnelUser(form);
      eventBus.emit('TOAST', { type: 'success', message: 'کاربر جدید ثبت شد.' });
      await loadUsers();
    }
    formOpen.value = false;
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
    confirmDelete.value = null;
    await loadUsers();
  } catch (error) {
    eventBus.emit('TOAST', { type: 'error', message: 'حذف کاربر ناموفق بود.' });
  } finally {
    saving.value = false;
  }
};

watch([query, statusFilter, roleFilter], () => {
  setPage(1);
  loadUsers();
});

onMounted(() => {
  loadUsers();
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
