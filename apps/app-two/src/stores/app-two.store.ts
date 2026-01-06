import { defineStore } from 'pinia';

export const useAppTwoStore = defineStore('appTwo', {
  state: () => ({
    showUserModal: false,
    newUser: { name: '', role: 'کاربر' },
    reportDraft: {
      title: '',
      dateRange: '',
      notes: ''
    }
  }),
  actions: {
    resetUserDraft() {
      this.newUser = { name: '', role: 'کاربر' };
    },
    resetReportDraft() {
      this.reportDraft = { title: '', dateRange: '', notes: '' };
    }
  }
});
