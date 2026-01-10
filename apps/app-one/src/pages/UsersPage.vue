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

    <div class="card space-y-4 flex flex-col">
      <div class="filters">
        <input v-model="query" class="input" placeholder="جستجو بر اساس نام یا واحد" />
        <select v-model="statusFilter" class="input">
          <option value="all">همه وضعیت‌ها</option>
          <option value="فعال">فعال</option>
          <option value="غیرفعال">غیرفعال</option>
          <option value="تعلیق">تعلیق</option>
        </select>
        <button class="secondary-button" type="button" @click="reload">به‌روزرسانی</button>
      </div>

      <EnterpriseDataGrid
        v-if="!errorMessage"
        :row-data="filteredUsers"
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
        v-if="!loading && !errorMessage && filteredUsers.length === 0"
        title="کاربری ثبت نشده است"
        description="برای شروع یک کاربر جدید اضافه کنید."
      >
        <button class="action-button" type="button" @click="openCreate">افزودن کاربر</button>
      </EmptyState>
    </div>

    <div v-if="detailOpen" class="overlay" @click.self="detailOpen = false">
      <div class="drawer">
        <div class="drawer-header">
          <h3>جزئیات کاربر</h3>
          <button class="ghost-button" type="button" @click="detailOpen = false">بستن</button>
        </div>
        <div v-if="selectedUser" class="drawer-body">
          <p>نام: {{ selectedUser.fullName }}</p>
          <p>واحد: {{ selectedUser.department }}</p>
          <p>نقش: {{ selectedUser.role }}</p>
          <p>وضعیت: {{ selectedUser.status }}</p>
          <p>شماره تماس: {{ selectedUser.phone }}</p>
          <p>تاریخ ثبت: {{ selectedUser.createdAt }}</p>
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
import { computed, onMounted, reactive, ref } from 'vue';
import type { ColDef } from 'ag-grid-community';
import type { PersonnelUser } from '@shared/contracts';
import {
  createPersonnelUser,
  deletePersonnelUser,
  getPersonnelUsers,
  updatePersonnelUser
} from '@shared/api-client';
import { eventBus } from '@shared/store';

const query = ref('');
const statusFilter = ref<'all' | PersonnelUser['status']>('all');
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const users = ref<PersonnelUser[]>([]);
const selectedUser = ref<PersonnelUser | null>(null);
const detailOpen = ref(false);
const formOpen = ref(false);
const confirmDelete = ref<PersonnelUser | null>(null);
const editingUser = ref<PersonnelUser | null>(null);

const form = reactive({
  fullName: '',
  department: '',
  role: '',
  status: 'فعال' as PersonnelUser['status'],
  phone: ''
});

const columns: ColDef[] = [
  { field: 'fullName', headerName: 'نام' },
  { field: 'department', headerName: 'واحد' },
  { field: 'role', headerName: 'نقش' },
  { field: 'status', headerName: 'وضعیت' },
  { field: 'phone', headerName: 'شماره تماس' },
  { field: 'createdAt', headerName: 'تاریخ ثبت' }
];

const filteredUsers = computed(() =>
  users.value.filter((user) => {
    const matchesQuery =
      user.fullName.includes(query.value) || user.department.includes(query.value);
    const matchesStatus = statusFilter.value === 'all' || user.status === statusFilter.value;
    return matchesQuery && matchesStatus;
  })
);

const loadUsers = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const response = await getPersonnelUsers(1, 20);
    users.value = response.data;
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
      const created = await createPersonnelUser(form);
      users.value = [created, ...users.value];
      eventBus.emit('TOAST', { type: 'success', message: 'کاربر جدید ثبت شد.' });
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
    users.value = users.value.filter((item) => item.id !== confirmDelete.value?.id);
    eventBus.emit('TOAST', { type: 'info', message: 'کاربر حذف شد.' });
    confirmDelete.value = null;
  } catch (error) {
    eventBus.emit('TOAST', { type: 'error', message: 'حذف کاربر ناموفق بود.' });
  } finally {
    saving.value = false;
  }
};

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
