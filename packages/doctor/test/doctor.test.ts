import { describe, expect, it } from 'vitest';

import { runDoctor } from '../src/index.js';

describe('runDoctor', () => {
  it('returns a non-empty list of checks', async () => {
    const checks = await runDoctor();

    expect(checks.length).toBeGreaterThan(0);
  });

  it('passes adapter contract checks for registry adapters', async () => {
    const checks = await runDoctor();
    const adapterChecks = checks.filter((check) => check.id.startsWith('adapter.contract.'));

    expect(adapterChecks.length).toBeGreaterThan(0);
    expect(adapterChecks.every((check) => check.ok)).toBe(true);
  });
});
