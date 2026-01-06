import { mount, flushPromises } from '@vue/test-utils';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { setHostPinia, useHostAuthStore } from '@shared/store';
import { describe, expect, it, vi } from 'vitest';

vi.mock('appOne/AppOneMount', () => ({
  default: {
    template: '<div>AppOneStub</div>'
  }
}));

vi.mock('appTwo/AppTwoMount', () => ({
  default: {
    template: '<div>AppTwoStub</div>'
  }
}));

describe('shell routing', () => {
  it('navigates to remote routes', async () => {
    const pinia = createPinia();
    setHostPinia(pinia);
    const authStore = useHostAuthStore();
    authStore.setAuth('token', { id: '1', name: 'Tester', role: 'admin' });
    const wrapper = mount(App, {
      global: {
        plugins: [router, pinia],
        stubs: {
          UiButton: { template: '<button><slot /></button>' },
          UiToastHost: { template: '<div />' },
          UiSelect: { template: '<select />' },
          UiPage: { template: '<div><slot /></div>' },
          UiPageHeader: { template: '<div><slot /></div>' },
          UiSection: { template: '<div><slot /></div>' },
          UiTag: { template: '<span><slot /></span>' }
        }
      }
    });

    await router.push('/app-one');
    await flushPromises();

    expect(router.currentRoute.value.path).toContain('/app-one');
    wrapper.unmount();
  });
});
