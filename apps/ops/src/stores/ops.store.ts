import { defineStore } from 'pinia';

export const useOpsStore = defineStore('ops', {
  state: () => ({
    reportDraft: {
      title: '',
      description: ''
    }
  }),
  actions: {
    resetReport() {
      this.reportDraft = { title: '', description: '' };
    }
  }
});
