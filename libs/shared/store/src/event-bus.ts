import mitt from 'mitt';
import type { AppEventMap } from '@shared/contracts';

export const eventBus = mitt<AppEventMap>();
