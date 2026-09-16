import type { Request } from 'express';
import { describe, expect, it } from 'vitest';

import { shouldApplyBurstGuard } from '../middlewares/botGuard.js';

describe('bot guard routing', () => {
  it('applies burst detection to public APIs', () => {
    expect(shouldApplyBurstGuard({ path: '/api/public/vendors' } as Request)).toBe(true);
  });

  it('does not put authenticated operations in the shared IP burst bucket', () => {
    expect(
      shouldApplyBurstGuard({ path: '/api/v1/operations/adminGetVendorsAll' } as Request),
    ).toBe(false);
  });
});
