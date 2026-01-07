import { defineStore } from 'pinia';

export const useInsuranceStore = defineStore('insurance', {
  state: () => ({
    requestFilter: '',
    claimFilter: '',
    newRequest: {
      employeeName: '',
      type: 'بیمه جدید',
      amount: 500
    },
    newClaim: {
      policyId: 'بیمه-۱',
      claimant: '',
      amount: 200
    },
    policyDraft: {
      holder: '',
      plan: 'استاندارد',
      status: 'فعال',
      renewalDate: ''
    }
  }),
  actions: {
    resetRequest() {
      this.newRequest = { employeeName: '', type: 'بیمه جدید', amount: 500 };
    },
    resetClaim() {
      this.newClaim = { policyId: 'بیمه-۱', claimant: '', amount: 200 };
    },
    resetPolicy() {
      this.policyDraft = { holder: '', plan: 'استاندارد', status: 'فعال', renewalDate: '' };
    }
  }
});
