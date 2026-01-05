import { expect, test } from 'vitest';
import { normalizeError } from './index';

test('normalizeError returns consistent object', () => {
  const error = normalizeError(404, 'Not found', { info: 'missing' });
  expect(error).toEqual({
    status: 404,
    code: 'HTTP_404',
    message: 'Not found',
    details: { info: 'missing' }
  });
});
