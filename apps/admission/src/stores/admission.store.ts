import { defineStore } from 'pinia';

export const useAdmissionStore = defineStore('admission', {
  state: () => ({
    filter: '',
    reviewDraft: { score: 0, notes: '' },
    decisionDraft: { decision: 'accept', reason: '' }
  }),
  actions: {
    resetReview() {
      this.reviewDraft = { score: 0, notes: '' };
    },
    resetDecision() {
      this.decisionDraft = { decision: 'accept', reason: '' };
    }
  }
});
