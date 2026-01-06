import { defineStore } from 'pinia';

export const useAppOneStore = defineStore('appOne', {
  state: () => ({
    orderQuery: '',
    dashboardCounter: 0,
    summary: { activeOrders: 3, region: 'US-East' }
  }),
  actions: {
    setOrderQuery(query: string) {
      this.orderQuery = query;
    },
    incrementCounter() {
      this.dashboardCounter += 1;
    }
  }
});
