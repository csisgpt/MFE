import { defineStore } from 'pinia';

export const useAppOneStore = defineStore('appOne', {
  state: () => ({
    orderQuery: '',
    dashboardCounter: 0,
    summary: { activeOrders: 3, region: 'شرق کشور' }
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
