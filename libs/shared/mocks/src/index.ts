import type { PersonnelUser, ServiceRequest } from '@shared/contracts';

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type MockDb = {
  users: PersonnelUser[];
  requests: ServiceRequest[];
};

export const createMockDb = (): MockDb => ({
  users: [
    {
      id: 'کاربر-۱۰۰۱',
      username: 'مریم.هاشمی',
      fullName: 'مریم هاشمی',
      department: 'منابع انسانی',
      role: 'کارشناس ارشد',
      status: 'فعال',
      phone: '۰۹۱۲۳۴۵۶۷۸۹',
      createdAt: '2024-09-01T08:30:00Z'
    },
    {
      id: 'کاربر-۱۰۰۲',
      username: 'علیرضا.کاظمی',
      fullName: 'علیرضا کاظمی',
      department: 'فناوری اطلاعات',
      role: 'مدیر سیستم',
      status: 'فعال',
      phone: '۰۹۱۲۹۸۷۶۵۴۳',
      createdAt: '2024-08-28T10:12:00Z'
    },
    {
      id: 'کاربر-۱۰۰۳',
      username: 'پریسا.صادقی',
      fullName: 'پریسا صادقی',
      department: 'عملیات',
      role: 'سرپرست تیم',
      status: 'غیرفعال',
      phone: '۰۹۱۰۴۵۶۷۸۱۲',
      createdAt: '2024-08-20T09:05:00Z'
    },
    {
      id: 'کاربر-۱۰۰۴',
      username: 'حسین.باقری',
      fullName: 'حسین باقری',
      department: 'مالی',
      role: 'تحلیل‌گر',
      status: 'فعال',
      phone: '۰۹۱۳۷۵۶۴۹۲۳',
      createdAt: '2024-08-12T13:45:00Z'
    },
    {
      id: 'کاربر-۱۰۰۵',
      username: 'ریحانه.موسوی',
      fullName: 'ریحانه موسوی',
      department: 'پشتیبانی',
      role: 'کارشناس پشتیبانی',
      status: 'تعلیق',
      phone: '۰۹۱۹۱۲۳۴۵۶۷',
      createdAt: '2024-08-05T07:25:00Z'
    }
  ],
  requests: [
    {
      id: 'درخواست-۲۰۰۱',
      title: 'راه‌اندازی دسترسی جدید شبکه',
      requester: 'سارا احمدی',
      assignee: 'علیرضا کاظمی',
      status: 'جدید',
      priority: 'بالا',
      createdAt: '2024-09-03T07:40:00Z'
    },
    {
      id: 'درخواست-۲۰۰۲',
      title: 'بازبینی سطوح دسترسی مالی',
      requester: 'حسین باقری',
      assignee: 'مریم هاشمی',
      status: 'در حال بررسی',
      priority: 'متوسط',
      createdAt: '2024-09-01T11:20:00Z'
    },
    {
      id: 'درخواست-۲۰۰۳',
      title: 'تهیه گزارش ظرفیت مرکز تماس',
      requester: 'ریحانه موسوی',
      assignee: 'پریسا صادقی',
      status: 'انجام شد',
      priority: 'کم',
      createdAt: '2024-08-29T09:50:00Z'
    },
    {
      id: 'درخواست-۲۰۰۴',
      title: 'بازآموزی فرآیندهای ورود نیرو',
      requester: 'مریم هاشمی',
      assignee: 'سارا احمدی',
      status: 'رد شد',
      priority: 'بالا',
      createdAt: '2024-08-25T14:10:00Z'
    }
  ]
});

export const paginate = <T>(items: T[], page: number, pageSize: number): PaginatedResult<T> => {
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10;
  const start = (safePage - 1) * safePageSize;
  const data = items.slice(start, start + safePageSize);

  return {
    data,
    total: items.length,
    page: safePage,
    pageSize: safePageSize
  };
};
