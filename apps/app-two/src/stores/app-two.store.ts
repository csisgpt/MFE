import { defineStore } from 'pinia';

export const useAppTwoStore = defineStore('appTwo', {
  state: () => ({
    showUserModal: false,
    newUser: { name: '', role: 'user' },
    reportDraft: {
      title: '',
      dateRange: '',
      notes: ''
    }
  }),
  actions: {
    resetUserDraft() {
      this.newUser = { name: '', role: 'user' };
    },
    resetReportDraft() {
      this.reportDraft = { title: '', dateRange: '', notes: '' };
    }
  }
});
