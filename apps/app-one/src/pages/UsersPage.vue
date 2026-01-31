<template>
  <div class="grow! flex flex-col">
    <PageHeader title="کاربران" subtitle="مدیریت کاربران و پرسنل سازمان">
      <template #breadcrumbs>
        <Breadcrumbs :items="[{ label: 'اپلیکیشن یک' }, { label: 'کاربران' }]" />
      </template>
      <template #actions>
        <button class="action-button" type="button" @click="openCreate">افزودن کاربر</button>
      </template>
    </PageHeader>

    <div class="card bg-surface-muted! grow!">
      <MainTable
        v-if="!errorMessage"
        class="min-h-[300px]"
        :local-data="mainData"
        mode="local"
        :row-model-type="'clientSide'"
        title="تسهیم اعتبار ستادی"
        :column-defs="mainColumnDefs"
        :default-col-def="defaultColDef"
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

    <UiModal v-model:open="formOpen" title="افزودن کاربر" @ok="submitForm">
      <div>
        <!-- <div class="drawer-header">
          <h3>{{ editingUser ? 'ویرایش کاربر' : 'افزودن کاربر' }}</h3>
          <button class="ghost-button" type="button" @click="closeForm">بستن</button>
        </div> -->
        <UiForm class="form" @submit.prevent="submitForm">
          <UiFormItem label="نام و نام خانوادگی">
            <UiInput v-model="form.fullName" required />
          </UiFormItem>

          <UiFormItem label="واحد سازمانی">
            <UiInput v-model="form.department" required />
          </UiFormItem>
          <UiFormItem label="نقش سازمانی">
            <UiInput v-model="form.role" required />
          </UiFormItem>

          <UiFormItem label="وضعیت">
            <UiSelect v-model:value="form.status" :options="userStatusOptions" />
          </UiFormItem>
          <UiFormItem label="شماره تماس">
            <UiInput v-model="form.phone" required />
          </UiFormItem>
        </UiForm>
      </div>
    </UiModal>

    <!-- <div v-if="formOpen" class="overlay" @click.self="closeForm"></div> -->

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
  </div class="grow!">
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, defineAsyncComponent, shallowRef } from 'vue';
import type { ColDef, GridApi, GridOptions, ICellRendererParams } from 'ag-grid-community';
import type { PersonnelUser } from '@shared/contracts';
import {
  createPersonnelUser,
  deletePersonnelUser,
  getPersonnelUsers,
  updatePersonnelUser
} from '@shared/api-client';
import { eventBus } from '@shared/store';
import { UiModal, UiInput, UiSelect, UiForm, UiFormItem, MainTable } from '@shared/ui';

type ShareDto = {
  id: number;
  costCenterId: number;
  costCenterTitle: string;
  amount: number;
  usedAmount: number;
  remainingAmount: number;
};

type TashimRow = AllocationRequestDto & {
  allocationRequestId: number;
  systemId: string;
  subject: string;

  activityId: number;
  activityTitle: string;
  sectionTitle: string;
  programTitle: string;

  approvedCredit: number;
  usedCredit: number;
  remainingCredit: number;

  shares: ShareDto[];
  hasShares: boolean;
  id: number;
};

const usableDataGrid = defineAsyncComponent(() => MainTable);
// const MainTable = defineAsyncComponent(() => import('@/shared/ui').then((m) => m.MainTable));

const mainData = ref([
  {
    systemId: '1404-10003',
    subject: 'شسیشسی',
    shareType: null,
    approvedCredit: 1000,
    usedCredit: 0,
    remainingCredit: 1000,
    shares: [],
    items: [
      {
        allocationRequestId: 1928,
        systemId: '1404-10003-01',
        activityId: 49,
        allocatedBudgetActivityId: 564,
        allocatedBudgetActivityTitle: 'فعالیت 1',
        sectionId: '21',
        sectionTitle: 'فصل 1',
        budgetProgramId: '26',
        budgetProgramTitle: 'برنامه 1',
        approvedCredit: 1000,
        id: 1490
      }
    ],
    hasShares: false,
    id: 1928
  },
  {
    systemId: '1404-10004',
    subject: 'یبسیب',
    shareType: null,
    approvedCredit: 1111000,
    usedCredit: 0,
    remainingCredit: 1111000,
    shares: [],
    items: [
      {
        allocationRequestId: 1929,
        systemId: '1404-10004-01',
        activityId: 49,
        allocatedBudgetActivityId: 564,
        allocatedBudgetActivityTitle: 'فعالیت 1',
        sectionId: '21',
        sectionTitle: 'فصل 1',
        budgetProgramId: '26',
        budgetProgramTitle: 'برنامه 1',
        approvedCredit: 1111000,
        id: 1491
      }
    ],
    hasShares: false,
    id: 1929
  },
  {
    systemId: '1404-10005',
    subject: 'شسیبسب',
    shareType: 2,
    approvedCredit: 34534000,
    usedCredit: 0,
    remainingCredit: 34534000,
    shares: [
      {
        costCenterId: 104,
        costCenterTitle: 'مدیریت سامانه‌های الکترونیک و خدمات هوشمند',
        amount: 8500000,
        usedAmount: 0,
        remainingAmount: 8500000,
        allocationRequestItemId: null,
        allocationRequestItemSystemId: null,
        allocatedBudgetActivityTitle: null,
        budgetProgramId: null,
        budgetProgramTitle: null,
        sectionId: 21,
        sectionTitle: 'فصل 1',
        id: 16
      },
      {
        costCenterId: 111,
        costCenterTitle: 'مرکز خدمات استان سمنان',
        amount: 10000000,
        usedAmount: 0,
        remainingAmount: 10000000,
        allocationRequestItemId: null,
        allocationRequestItemSystemId: null,
        allocatedBudgetActivityTitle: null,
        budgetProgramId: null,
        budgetProgramTitle: null,
        sectionId: 21,
        sectionTitle: 'فصل 1',
        id: 17
      },
      {
        costCenterId: 112,
        costCenterTitle: 'مرکز خدمات استان قم',
        amount: 13500000,
        usedAmount: 0,
        remainingAmount: 13500000,
        allocationRequestItemId: null,
        allocationRequestItemSystemId: null,
        allocatedBudgetActivityTitle: null,
        budgetProgramId: null,
        budgetProgramTitle: null,
        sectionId: 21,
        sectionTitle: 'فصل 1',
        id: 18
      }
    ],
    items: [
      {
        allocationRequestId: 1930,
        systemId: '1404-10005-01',
        activityId: 50,
        allocatedBudgetActivityId: 571,
        allocatedBudgetActivityTitle: 'فعالیت 2',
        sectionId: '21',
        sectionTitle: 'فصل 1',
        budgetProgramId: '26',
        budgetProgramTitle: 'برنامه 1',
        approvedCredit: 34534000,
        id: 1492
      }
    ],
    hasShares: true,
    id: 1930
  },
  {
    systemId: '1404-10070',
    subject: 'شسیسشیشسی',
    shareType: 4,
    approvedCredit: 896666665000,
    usedCredit: 0,
    remainingCredit: 896666665000,
    shares: [
      {
        costCenterId: 104,
        costCenterTitle: 'مدیریت سامانه‌های الکترونیک و خدمات هوشمند',
        amount: 200000000,
        usedAmount: 0,
        remainingAmount: 200000000,
        allocationRequestItemId: 1510,
        allocationRequestItemSystemId: '1404-10070-01',
        allocatedBudgetActivityTitle: 'فعالیت 1',
        budgetProgramId: null,
        budgetProgramTitle: null,
        sectionId: null,
        sectionTitle: null,
        id: 1
      },
      {
        costCenterId: 111,
        costCenterTitle: 'مرکز خدمات استان سمنان',
        amount: 200000000,
        usedAmount: 0,
        remainingAmount: 200000000,
        allocationRequestItemId: 1510,
        allocationRequestItemSystemId: '1404-10070-01',
        allocatedBudgetActivityTitle: 'فعالیت 1',
        budgetProgramId: null,
        budgetProgramTitle: null,
        sectionId: null,
        sectionTitle: null,
        id: 2
      },
      {
        costCenterId: 112,
        costCenterTitle: 'مرکز خدمات استان قم',
        amount: 200000000,
        usedAmount: 0,
        remainingAmount: 200000000,
        allocationRequestItemId: 1510,
        allocationRequestItemSystemId: '1404-10070-01',
        allocatedBudgetActivityTitle: 'فعالیت 1',
        budgetProgramId: null,
        budgetProgramTitle: null,
        sectionId: null,
        sectionTitle: null,
        id: 3
      },
      {
        costCenterId: 104,
        costCenterTitle: 'مدیریت سامانه‌های الکترونیک و خدمات هوشمند',
        amount: 200000000,
        usedAmount: 0,
        remainingAmount: 200000000,
        allocationRequestItemId: 1511,
        allocationRequestItemSystemId: '1404-10070-02',
        allocatedBudgetActivityTitle: 'فعالیت 2',
        budgetProgramId: null,
        budgetProgramTitle: null,
        sectionId: null,
        sectionTitle: null,
        id: 4
      },
      {
        costCenterId: 111,
        costCenterTitle: 'مرکز خدمات استان سمنان',
        amount: 200000000,
        usedAmount: 0,
        remainingAmount: 200000000,
        allocationRequestItemId: 1511,
        allocationRequestItemSystemId: '1404-10070-02',
        allocatedBudgetActivityTitle: 'فعالیت 2',
        budgetProgramId: null,
        budgetProgramTitle: null,
        sectionId: null,
        sectionTitle: null,
        id: 5
      },
      {
        costCenterId: 112,
        costCenterTitle: 'مرکز خدمات استان قم',
        amount: 200000000,
        usedAmount: 0,
        remainingAmount: 200000000,
        allocationRequestItemId: 1511,
        allocationRequestItemSystemId: '1404-10070-02',
        allocatedBudgetActivityTitle: 'فعالیت 2',
        budgetProgramId: null,
        budgetProgramTitle: null,
        sectionId: null,
        sectionTitle: null,
        id: 6
      }
    ],
    items: [
      {
        allocationRequestId: 1997,
        systemId: '1404-10070-01',
        activityId: 49,
        allocatedBudgetActivityId: 564,
        allocatedBudgetActivityTitle: 'فعالیت 1',
        sectionId: '21',
        sectionTitle: 'فصل 1',
        budgetProgramId: '26',
        budgetProgramTitle: 'برنامه 1',
        approvedCredit: 7777777000,
        id: 1510
      },
      {
        allocationRequestId: 1997,
        systemId: '1404-10070-02',
        activityId: 50,
        allocatedBudgetActivityId: 571,
        allocatedBudgetActivityTitle: 'فعالیت 2',
        sectionId: '21',
        sectionTitle: 'فصل 1',
        budgetProgramId: '26',
        budgetProgramTitle: 'برنامه 1',
        approvedCredit: 888888888000,
        id: 1511
      }
    ],
    hasShares: true,
    id: 1997
  },
  {
    systemId: '1404-10073',
    subject: 'sadsadsadas',
    shareType: null,
    approvedCredit: 10000,
    usedCredit: 0,
    remainingCredit: 10000,
    shares: [],
    items: [
      {
        allocationRequestId: 2000,
        systemId: '1404-10073-01',
        activityId: 49,
        allocatedBudgetActivityId: 564,
        allocatedBudgetActivityTitle: 'فعالیت 1',
        sectionId: '21',
        sectionTitle: 'فصل 1',
        budgetProgramId: '26',
        budgetProgramTitle: 'برنامه 1',
        approvedCredit: 10000,
        id: 1516
      }
    ],
    hasShares: false,
    id: 2000
  },
  {
    systemId: '1404-10079',
    subject: 'تست سیستم جدید v4-',
    shareType: 2,
    approvedCredit: 1000,
    usedCredit: 0,
    remainingCredit: 1000,
    shares: [
      {
        costCenterId: 104,
        costCenterTitle: 'مدیریت سامانه‌های الکترونیک و خدمات هوشمند',
        amount: 100,
        usedAmount: 0,
        remainingAmount: 100,
        allocationRequestItemId: null,
        allocationRequestItemSystemId: null,
        allocatedBudgetActivityTitle: null,
        budgetProgramId: null,
        budgetProgramTitle: null,
        sectionId: 21,
        sectionTitle: 'فصل 1',
        id: 13
      },
      {
        costCenterId: 111,
        costCenterTitle: 'مرکز خدمات استان سمنان',
        amount: 300,
        usedAmount: 0,
        remainingAmount: 300,
        allocationRequestItemId: null,
        allocationRequestItemSystemId: null,
        allocatedBudgetActivityTitle: null,
        budgetProgramId: null,
        budgetProgramTitle: null,
        sectionId: 21,
        sectionTitle: 'فصل 1',
        id: 14
      },
      {
        costCenterId: 112,
        costCenterTitle: 'مرکز خدمات استان قم',
        amount: 600,
        usedAmount: 0,
        remainingAmount: 600,
        allocationRequestItemId: null,
        allocationRequestItemSystemId: null,
        allocatedBudgetActivityTitle: null,
        budgetProgramId: null,
        budgetProgramTitle: null,
        sectionId: 21,
        sectionTitle: 'فصل 1',
        id: 15
      }
    ],
    items: [
      {
        allocationRequestId: 2006,
        systemId: '1404-10079-01',
        activityId: 49,
        allocatedBudgetActivityId: 564,
        allocatedBudgetActivityTitle: 'فعالیت 1',
        sectionId: '21',
        sectionTitle: 'فصل 1',
        budgetProgramId: '26',
        budgetProgramTitle: 'برنامه 1',
        approvedCredit: 1000,
        id: 1519
      }
    ],
    hasShares: true,
    id: 2006
  },
  {
    systemId: '1404-10134',
    subject: 'dsfsdfsdf',
    shareType: 4,
    approvedCredit: 36007184599,
    usedCredit: 2773235101,
    remainingCredit: 33233949498,
    shares: [
      {
        costCenterId: 104,
        costCenterTitle: 'مدیریت سامانه‌های الکترونیک و خدمات هوشمند',
        amount: 1000,
        usedAmount: 2550867867,
        remainingAmount: -2550866867,
        allocationRequestItemId: 1574,
        allocationRequestItemSystemId: '1404-10134-01',
        allocatedBudgetActivityTitle: 'فعالیت 1',
        budgetProgramId: null,
        budgetProgramTitle: null,
        sectionId: null,
        sectionTitle: null,
        id: 7
      },
      {
        costCenterId: 111,
        costCenterTitle: 'مرکز خدمات استان سمنان',
        amount: 500,
        usedAmount: 0,
        remainingAmount: 500,
        allocationRequestItemId: 1574,
        allocationRequestItemSystemId: '1404-10134-01',
        allocatedBudgetActivityTitle: 'فعالیت 1',
        budgetProgramId: null,
        budgetProgramTitle: null,
        sectionId: null,
        sectionTitle: null,
        id: 8
      },
      {
        costCenterId: 112,
        costCenterTitle: 'مرکز خدمات استان قم',
        amount: 400,
        usedAmount: 0,
        remainingAmount: 400,
        allocationRequestItemId: 1574,
        allocationRequestItemSystemId: '1404-10134-01',
        allocatedBudgetActivityTitle: 'فعالیت 1',
        budgetProgramId: null,
        budgetProgramTitle: null,
        sectionId: null,
        sectionTitle: null,
        id: 9
      },
      {
        costCenterId: 104,
        costCenterTitle: 'مدیریت سامانه‌های الکترونیک و خدمات هوشمند',
        amount: 30000000000,
        usedAmount: 222367234,
        remainingAmount: 29777632766,
        allocationRequestItemId: 1575,
        allocationRequestItemSystemId: '1404-10134-02',
        allocatedBudgetActivityTitle: 'فعالیت 1',
        budgetProgramId: null,
        budgetProgramTitle: null,
        sectionId: null,
        sectionTitle: null,
        id: 10
      },
      {
        costCenterId: 111,
        costCenterTitle: 'مرکز خدمات استان سمنان',
        amount: 3000000000,
        usedAmount: 0,
        remainingAmount: 3000000000,
        allocationRequestItemId: 1575,
        allocationRequestItemSystemId: '1404-10134-02',
        allocatedBudgetActivityTitle: 'فعالیت 1',
        budgetProgramId: null,
        budgetProgramTitle: null,
        sectionId: null,
        sectionTitle: null,
        id: 11
      },
      {
        costCenterId: 112,
        costCenterTitle: 'مرکز خدمات استان قم',
        amount: 3000000000,
        usedAmount: 0,
        remainingAmount: 3000000000,
        allocationRequestItemId: 1575,
        allocationRequestItemSystemId: '1404-10134-02',
        allocatedBudgetActivityTitle: 'فعالیت 1',
        budgetProgramId: null,
        budgetProgramTitle: null,
        sectionId: null,
        sectionTitle: null,
        id: 12
      }
    ],
    items: [
      {
        allocationRequestId: 2061,
        systemId: '1404-10134-01',
        activityId: 49,
        allocatedBudgetActivityId: 564,
        allocatedBudgetActivityTitle: 'فعالیت 1',
        sectionId: '21',
        sectionTitle: 'فصل 1',
        budgetProgramId: '26',
        budgetProgramTitle: 'برنامه 1',
        approvedCredit: 2000,
        id: 1574
      },
      {
        allocationRequestId: 2061,
        systemId: '1404-10134-02',
        activityId: 49,
        allocatedBudgetActivityId: 570,
        allocatedBudgetActivityTitle: 'فعالیت 1',
        sectionId: '21',
        sectionTitle: 'فصل 1',
        budgetProgramId: '26',
        budgetProgramTitle: 'برنامه 1',
        approvedCredit: 36007182599,
        id: 1575
      }
    ],
    hasShares: true,
    id: 2061
  },
  {
    systemId: '1404-10164',
    subject: 'رذزرذرزذرزذ',
    shareType: 3,
    approvedCredit: 850000000,
    usedCredit: 0,
    remainingCredit: 850000000,
    shares: [
      {
        costCenterId: 104,
        costCenterTitle: 'مدیریت سامانه‌های الکترونیک و خدمات هوشمند',
        amount: 32000000,
        usedAmount: 0,
        remainingAmount: 32000000,
        allocationRequestItemId: null,
        allocationRequestItemSystemId: null,
        allocatedBudgetActivityTitle: null,
        budgetProgramId: 26,
        budgetProgramTitle: 'برنامه 1',
        sectionId: null,
        sectionTitle: null,
        id: 22
      },
      {
        costCenterId: 111,
        costCenterTitle: 'مرکز خدمات استان سمنان',
        amount: 33000000,
        usedAmount: 0,
        remainingAmount: 33000000,
        allocationRequestItemId: null,
        allocationRequestItemSystemId: null,
        allocatedBudgetActivityTitle: null,
        budgetProgramId: 26,
        budgetProgramTitle: 'برنامه 1',
        sectionId: null,
        sectionTitle: null,
        id: 23
      },
      {
        costCenterId: 112,
        costCenterTitle: 'مرکز خدمات استان قم',
        amount: 34500000,
        usedAmount: 0,
        remainingAmount: 34500000,
        allocationRequestItemId: null,
        allocationRequestItemSystemId: null,
        allocatedBudgetActivityTitle: null,
        budgetProgramId: 26,
        budgetProgramTitle: 'برنامه 1',
        sectionId: null,
        sectionTitle: null,
        id: 24
      }
    ],
    items: [
      {
        allocationRequestId: 2092,
        systemId: '1404-10164-01',
        activityId: 49,
        allocatedBudgetActivityId: 566,
        allocatedBudgetActivityTitle: 'فعالیت 1',
        sectionId: '21',
        sectionTitle: 'فصل 1',
        budgetProgramId: '26',
        budgetProgramTitle: 'برنامه 1',
        approvedCredit: 100000000,
        id: 1626
      },
      {
        allocationRequestId: 2092,
        systemId: '1404-10164-02',
        activityId: 49,
        allocatedBudgetActivityId: 570,
        allocatedBudgetActivityTitle: 'فعالیت 1',
        sectionId: '21',
        sectionTitle: 'فصل 1',
        budgetProgramId: '26',
        budgetProgramTitle: 'برنامه 1',
        approvedCredit: 100000000,
        id: 1627
      },
      {
        allocationRequestId: 2092,
        systemId: '1404-10164-03',
        activityId: 49,
        allocatedBudgetActivityId: 564,
        allocatedBudgetActivityTitle: 'فعالیت 1',
        sectionId: '21',
        sectionTitle: 'فصل 1',
        budgetProgramId: '26',
        budgetProgramTitle: 'برنامه 1',
        approvedCredit: 650000000,
        id: 1628
      }
    ],
    hasShares: true,
    id: 2092
  },
  {
    systemId: '1404-10168',
    subject: 'غقفغفقغفقغفقغ',
    shareType: 2,
    approvedCredit: 793300000,
    usedCredit: 0,
    remainingCredit: 793300000,
    shares: [
      {
        costCenterId: 104,
        costCenterTitle: 'مدیریت سامانه‌های الکترونیک و خدمات هوشمند',
        amount: 4000000,
        usedAmount: 0,
        remainingAmount: 4000000,
        allocationRequestItemId: null,
        allocationRequestItemSystemId: null,
        allocatedBudgetActivityTitle: null,
        budgetProgramId: null,
        budgetProgramTitle: null,
        sectionId: 21,
        sectionTitle: 'فصل 1',
        id: 19
      },
      {
        costCenterId: 111,
        costCenterTitle: 'مرکز خدمات استان سمنان',
        amount: 4100000,
        usedAmount: 0,
        remainingAmount: 4100000,
        allocationRequestItemId: null,
        allocationRequestItemSystemId: null,
        allocatedBudgetActivityTitle: null,
        budgetProgramId: null,
        budgetProgramTitle: null,
        sectionId: 21,
        sectionTitle: 'فصل 1',
        id: 20
      },
      {
        costCenterId: 112,
        costCenterTitle: 'مرکز خدمات استان قم',
        amount: 4200000,
        usedAmount: 0,
        remainingAmount: 4200000,
        allocationRequestItemId: null,
        allocationRequestItemSystemId: null,
        allocatedBudgetActivityTitle: null,
        budgetProgramId: null,
        budgetProgramTitle: null,
        sectionId: 21,
        sectionTitle: 'فصل 1',
        id: 21
      }
    ],
    items: [
      {
        allocationRequestId: 2096,
        systemId: '1404-10168-01',
        activityId: 49,
        allocatedBudgetActivityId: 564,
        allocatedBudgetActivityTitle: 'فعالیت 1',
        sectionId: '21',
        sectionTitle: 'فصل 1',
        budgetProgramId: '26',
        budgetProgramTitle: 'برنامه 1',
        approvedCredit: 12300000,
        id: 1630
      },
      {
        allocationRequestId: 2096,
        systemId: '1404-10168-02',
        activityId: 49,
        allocatedBudgetActivityId: 570,
        allocatedBudgetActivityTitle: 'فعالیت 1',
        sectionId: '21',
        sectionTitle: 'فصل 1',
        budgetProgramId: '26',
        budgetProgramTitle: 'برنامه 1',
        approvedCredit: 10000000,
        id: 1631
      },
      {
        allocationRequestId: 2096,
        systemId: '1404-10168-03',
        activityId: 49,
        allocatedBudgetActivityId: 566,
        allocatedBudgetActivityTitle: 'فعالیت 1',
        sectionId: '21',
        sectionTitle: 'فصل 1',
        budgetProgramId: '26',
        budgetProgramTitle: 'برنامه 1',
        approvedCredit: 250000000,
        id: 1632
      },
      {
        allocationRequestId: 2096,
        systemId: '1404-10168-04',
        activityId: 50,
        allocatedBudgetActivityId: 571,
        allocatedBudgetActivityTitle: 'فعالیت 2',
        sectionId: '21',
        sectionTitle: 'فصل 1',
        budgetProgramId: '26',
        budgetProgramTitle: 'برنامه 1',
        approvedCredit: 521000000,
        id: 1633
      }
    ],
    hasShares: true,
    id: 2096
  }
]);
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
const userStatusOptions = [
  { label: 'فعال', value: 1 },
  { label: 'غیر فعال', value: 2 },
  { label: 'تعلیق', value: 3 }
];

const form = reactive({
  fullName: '',
  department: '',
  role: '',
  status: 'فعال' as PersonnelUser['status'],
  phone: ''
});

const defaultColDef: ColDef = {
  resizable: true,
  sortable: true,
  filter: true,
  flex: 1,
  autoHeight: true
};

const formatFaInt = (val: unknown) => {
  const n = Number(val);
  if (!Number.isFinite(n)) return '';
  return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(n);
};

const calcPercent = (used: number, total: number) => {
  const t = Number(total ?? 0);
  const u = Number(used ?? 0);
  return t > 0 ? Math.round((u / t) * 100) : 0;
};

function progressRenderer(p: ICellRendererParams<TashimRow>) {
  const el = document.createElement('div');
  el.style.width = '180px';

  const row = p.data;
  const percent = calcPercent(row?.usedCredit ?? 0, row?.approvedCredit ?? 0);

  const label = document.createElement('div');
  label.className = 'text-[12px] text-gray-600 mb-1';
  label.textContent = `${percent}%`;

  const barWrap = document.createElement('div');
  barWrap.style.cssText =
    'height:6px;background:rgba(0,0,0,0.1);border-radius:999px;overflow:hidden;';

  const bar = document.createElement('div');
  bar.style.cssText = `height:6px;width:${percent}%;background:rgb(34,197,94);`;

  barWrap.appendChild(bar);
  el.appendChild(label);
  el.appendChild(barWrap);
  return el;
}

function sharesCountRenderer(p: ICellRendererParams<TashimRow>) {
  const el = document.createElement('span');
  const n = Array.isArray(p.data?.shares) ? p.data!.shares.length : 0;
  el.textContent = n ? String(n) : '—';
  return el;
}

const mainColumnDefs = shallowRef<ColDef<TashimRow>[]>([
  { field: 'systemId', headerName: 'کد تخصیص', minWidth: 150 },
  { field: 'subject', headerName: 'موضوع', minWidth: 200 },
  { field: 'activityTitle', headerName: 'فعالیت', minWidth: 160 },
  //   { field: "sectionTitle", headerName: "فصل", minWidth: 140 },
  //   { field: "programTitle", headerName: "برنامه", minWidth: 140 },

  {
    field: 'approvedCredit',
    headerName: 'اعتبار مصوب',
    minWidth: 150,
    valueFormatter: (p) => formatFaInt(p.value),
    tooltipValueGetter: (p) => formatFaInt(p.value)
  },
  {
    field: 'usedCredit',
    headerName: 'هزینه‌کرد',
    minWidth: 140,
    valueFormatter: (p) => formatFaInt(p.value),
    tooltipValueGetter: (p) => formatFaInt(p.value)
  },
  {
    field: 'remainingCredit',
    headerName: 'مانده',
    minWidth: 140,
    valueFormatter: (p) => formatFaInt(p.value),
    tooltipValueGetter: (p) => formatFaInt(p.value)
  },

  // محاسباتی‌ها (بدون field)
  {
    colId: 'progress',
    headerName: 'وضعیت مصرف',
    minWidth: 220,
    sortable: false,
    filter: false,
    cellRenderer: progressRenderer as any,
    chartDataType: 'excluded'
  },
  {
    colId: 'sharesCount',
    headerName: 'تسهیم‌ها',
    minWidth: 110,
    sortable: false,
    filter: false,
    cellRenderer: sharesCountRenderer as any,
    chartDataType: 'excluded'
  }
]);

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


