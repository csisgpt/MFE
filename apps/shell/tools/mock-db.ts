export type PersonnelUser = {
  id: string;
  fullName: string;
  department: string;
  role: string;
  status: string;
  phone: string;
  createdAt: string;
};

export type ServiceRequest = {
  id: string;
  title: string;
  requester: string;
  assignee: string;
  status: string;
  priority: string;
  createdAt: string;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type MockDb = {
  personnelUsers: PersonnelUser[];
  serviceRequests: ServiceRequest[];
};

export const createMockDb = (): MockDb => ({
  personnelUsers: [
    {
      id: 'کاربر-۱۰۰۱',
      fullName: 'مریم هاشمی',
      department: 'منابع انسانی',
      role: 'کارشناس ارشد',
      status: 'فعال',
      phone: '۰۹۱۲۳۴۵۶۷۸۹',
      createdAt: '۱۴۰۳/۰۱/۱۵'
    },
    {
      id: 'کاربر-۱۰۰۲',
      fullName: 'علیرضا کاظمی',
      department: 'فناوری اطلاعات',
      role: 'مدیر سیستم',
      status: 'فعال',
      phone: '۰۹۱۲۹۸۷۶۵۴۳',
      createdAt: '۱۴۰۳/۰۱/۰۹'
    },
    {
      id: 'کاربر-۱۰۰۳',
      fullName: 'پریسا صادقی',
      department: 'عملیات',
      role: 'سرپرست تیم',
      status: 'غیرفعال',
      phone: '۰۹۱۰۴۵۶۷۸۱۲',
      createdAt: '۱۴۰۲/۱۲/۲۸'
    },
    {
      id: 'کاربر-۱۰۰۴',
      fullName: 'حسین باقری',
      department: 'مالی',
      role: 'تحلیل‌گر',
      status: 'فعال',
      phone: '۰۹۱۳۷۵۶۴۹۲۳',
      createdAt: '۱۴۰۲/۱۲/۲۰'
    },
    {
      id: 'کاربر-۱۰۰۵',
      fullName: 'ریحانه موسوی',
      department: 'پشتیبانی',
      role: 'کارشناس پشتیبانی',
      status: 'تعلیق',
      phone: '۰۹۱۹۱۲۳۴۵۶۷',
      createdAt: '۱۴۰۲/۱۲/۰۳'
    },
    {
      id: 'کاربر-۱۰۰۶',
      fullName: 'محمد امیری',
      department: 'منابع انسانی',
      role: 'مسئول جذب',
      status: 'فعال',
      phone: '۰۹۱۲۷۶۵۴۳۲۱',
      createdAt: '۱۴۰۳/۰۱/۰۲'
    },
    {
      id: 'کاربر-۱۰۰۷',
      fullName: 'الهام شفیعی',
      department: 'فناوری اطلاعات',
      role: 'کارشناس امنیت',
      status: 'فعال',
      phone: '۰۹۱۰۸۷۶۵۴۳۲',
      createdAt: '۱۴۰۲/۱۲/۲۴'
    },
    {
      id: 'کاربر-۱۰۰۸',
      fullName: 'جواد نادری',
      department: 'عملیات',
      role: 'کارشناس عملیات',
      status: 'غیرفعال',
      phone: '۰۹۱۳۴۵۶۷۸۹۰',
      createdAt: '۱۴۰۲/۱۱/۲۹'
    },
    {
      id: 'کاربر-۱۰۰۹',
      fullName: 'سحر رضایی',
      department: 'مالی',
      role: 'حسابرس داخلی',
      status: 'فعال',
      phone: '۰۹۱۵۶۷۸۹۰۱۲',
      createdAt: '۱۴۰۲/۱۲/۱۵'
    },
    {
      id: 'کاربر-۱۰۱۰',
      fullName: 'بابک کریمی',
      department: 'تدارکات',
      role: 'کارشناس قراردادها',
      status: 'تعلیق',
      phone: '۰۹۱۸۷۶۵۴۳۲۱',
      createdAt: '۱۴۰۲/۱۲/۰۹'
    },
    {
      id: 'کاربر-۱۰۱۱',
      fullName: 'نگار توکلی',
      department: 'بازاریابی',
      role: 'تحلیل‌گر بازار',
      status: 'فعال',
      phone: '۰۹۱۲۳۳۴۴۵۵۶',
      createdAt: '۱۴۰۲/۱۲/۰۶'
    },
    {
      id: 'کاربر-۱۰۱۲',
      fullName: 'کاوه نیک‌فر',
      department: 'پشتیبانی',
      role: 'سرپرست شیفت',
      status: 'فعال',
      phone: '۰۹۱۶۴۵۷۸۹۰۱',
      createdAt: '۱۴۰۳/۰۱/۰۶'
    }
  ],
  serviceRequests: [
    {
      id: 'درخواست-۲۰۰۱',
      title: 'راه‌اندازی دسترسی جدید شبکه',
      requester: 'سارا احمدی',
      assignee: 'علیرضا کاظمی',
      status: 'در انتظار',
      priority: 'بالا',
      createdAt: '۱۴۰۳/۰۱/۱۸'
    },
    {
      id: 'درخواست-۲۰۰۲',
      title: 'بازبینی سطوح دسترسی مالی',
      requester: 'حسین باقری',
      assignee: 'مریم هاشمی',
      status: 'در حال انجام',
      priority: 'متوسط',
      createdAt: '۱۴۰۳/۰۱/۱۶'
    },
    {
      id: 'درخواست-۲۰۰۳',
      title: 'تهیه گزارش ظرفیت مرکز تماس',
      requester: 'ریحانه موسوی',
      assignee: 'پریسا صادقی',
      status: 'تکمیل‌شده',
      priority: 'کم',
      createdAt: '۱۴۰۳/۰۱/۱۲'
    },
    {
      id: 'درخواست-۲۰۰۴',
      title: 'بازآموزی فرآیندهای ورود نیرو',
      requester: 'مریم هاشمی',
      assignee: 'سارا احمدی',
      status: 'در انتظار',
      priority: 'بالا',
      createdAt: '۱۴۰۳/۰۱/۰۸'
    },
    {
      id: 'درخواست-۲۰۰۵',
      title: 'به‌روزرسانی نرم‌افزار حسابداری',
      requester: 'حسین باقری',
      assignee: 'الهام شفیعی',
      status: 'در حال انجام',
      priority: 'بالا',
      createdAt: '۱۴۰۳/۰۱/۰۵'
    },
    {
      id: 'درخواست-۲۰۰۶',
      title: 'ثبت دسترسی تیم پشتیبانی جدید',
      requester: 'کاوه نیک‌فر',
      assignee: 'علیرضا کاظمی',
      status: 'در انتظار',
      priority: 'متوسط',
      createdAt: '۱۴۰۳/۰۱/۰۴'
    },
    {
      id: 'درخواست-۲۰۰۷',
      title: 'رفع اختلال سرویس پیامک',
      requester: 'الهام شفیعی',
      assignee: 'پریسا صادقی',
      status: 'در حال انجام',
      priority: 'بالا',
      createdAt: '۱۴۰۳/۰۱/۰۳'
    },
    {
      id: 'درخواست-۲۰۰۸',
      title: 'بازبینی قرارداد تامین تجهیزات',
      requester: 'بابک کریمی',
      assignee: 'سحر رضایی',
      status: 'تکمیل‌شده',
      priority: 'کم',
      createdAt: '۱۴۰۳/۰۱/۰۱'
    },
    {
      id: 'درخواست-۲۰۰۹',
      title: 'تنظیم داشبورد عملکرد فروش',
      requester: 'نگار توکلی',
      assignee: 'جواد نادری',
      status: 'در انتظار',
      priority: 'متوسط',
      createdAt: '۱۴۰۲/۱۲/۲۹'
    },
    {
      id: 'درخواست-۲۰۱۰',
      title: 'تهیه نسخه پشتیبان از سرور مرکزی',
      requester: 'علیرضا کاظمی',
      assignee: 'محمد امیری',
      status: 'تکمیل‌شده',
      priority: 'کم',
      createdAt: '۱۴۰۲/۱۲/۲۵'
    },
    {
      id: 'درخواست-۲۰۱۱',
      title: 'بررسی سیاست‌های امنیتی جدید',
      requester: 'الهام شفیعی',
      assignee: 'علیرضا کاظمی',
      status: 'لغو شده',
      priority: 'کم',
      createdAt: '۱۴۰۲/۱۲/۲۲'
    },
    {
      id: 'درخواست-۲۰۱۲',
      title: 'تحلیل شاخص‌های رضایت مشتریان',
      requester: 'سحر رضایی',
      assignee: 'نگار توکلی',
      status: 'در حال انجام',
      priority: 'متوسط',
      createdAt: '۱۴۰۲/۱۲/۱۹'
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
