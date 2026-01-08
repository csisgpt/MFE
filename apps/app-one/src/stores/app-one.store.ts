import { defineStore } from 'pinia';

export const useAppOneStore = defineStore('appOne', {
  state: () => ({
    summary: {
      activeUsers: 28,
      pendingRequests: 6,
      resolvedRequests: 18
    },
    recentActivity: [
      'ثبت درخواست جدید برای شبکه داخلی',
      'ویرایش اطلاعات کاربر واحد پشتیبانی',
      'تأیید درخواست سطح دسترسی مالی'
    ]
  })
});
