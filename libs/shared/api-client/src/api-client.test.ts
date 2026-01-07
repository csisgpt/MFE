import { expect, test } from 'vitest';
import { normalizeError } from './index';

test('normalizeError returns consistent object', () => {
  const error = normalizeError(404, 'یافت نشد', { info: 'ناموجود' });
  expect(error).toEqual({
    status: 404,
    code: 'HTTP_404',
    message: 'یافت نشد',
    details: { info: 'ناموجود' }
  });
});
