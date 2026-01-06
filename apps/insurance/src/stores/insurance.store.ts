import { defineStore } from 'pinia';

export const useInsuranceStore = defineStore('insurance', {
  state: () => ({
    requestFilter: '',
    claimFilter: '',
    newRequest: {
      employeeName: '',
      type: 'New Policy',
      amount: 500
    },
    newClaim: {
      policyId: 'p-1',
      claimant: '',
      amount: 200
    },
    policyDraft: {
      holder: '',
      plan: 'Standard',
      status: 'active',
      renewalDate: ''
    }
  }),
  actions: {
    resetRequest() {
      this.newRequest = { employeeName: '', type: 'New Policy', amount: 500 };
    },
    resetClaim() {
      this.newClaim = { policyId: 'p-1', claimant: '', amount: 200 };
    },
    resetPolicy() {
      this.policyDraft = { holder: '', plan: 'Standard', status: 'active', renewalDate: '' };
    }
  }
});
