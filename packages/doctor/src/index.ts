import { createRequire } from 'node:module';

import type { AdapterContract } from '@spurprotocol/types';

import { getAdapterRegistry } from './registry.js';

type AdapterForDoctor = {
  adapterId: string;
  endpoint: {
    type: string;
    uri: string;
  };
  interopContexts: string[];
  auditSupport: { emitsAuditEvents: boolean };
};

export type DoctorCheck = {
  id: string;
  ok: boolean;
  message: string;
  data?: Record<string, unknown>;
};

const require = createRequire(import.meta.url);

function coerceMajorNodeVersion(version: string): number {
  const parsed = Number.parseInt(version.replace(/^v/, '').split('.')[0] ?? '0', 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function isNonEmptyArray(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length > 0;
}

function checkAdapterContract(adapterContract: AdapterContract): DoctorCheck {
  const adapter = adapterContract as AdapterForDoctor;
  const contractOk = Boolean(
    adapter.adapterId
      && adapter.endpoint?.type
      && adapter.endpoint?.uri
      && isNonEmptyArray(adapter.interopContexts)
      && adapter.auditSupport?.emitsAuditEvents === true,
  );

  return {
    id: `adapter.contract.${adapter.adapterId}`,
    ok: contractOk,
    message: contractOk
      ? `Adapter '${adapter.adapterId}' contract is complete`
      : `Adapter '${adapter.adapterId}' contract is missing required fields`,
    data: {
      adapterId: adapter.adapterId,
      endpointType: adapter.endpoint?.type,
      endpointUri: adapter.endpoint?.uri,
      interopContextsCount: adapter.interopContexts?.length,
      emitsAuditEvents: adapter.auditSupport?.emitsAuditEvents,
    },
  };
}

function checkPackageResolvable(packageName: string): DoctorCheck {
  try {
    require(packageName);
    return {
      id: `package.resolvable.${packageName}`,
      ok: true,
      message: `${packageName} is resolvable`,
    };
  } catch (error) {
    return {
      id: `package.resolvable.${packageName}`,
      ok: false,
      message: `${packageName} is not resolvable`,
      data: { error: error instanceof Error ? error.message : String(error) },
    };
  }
}

export async function runDoctor(): Promise<DoctorCheck[]> {
  const checks: DoctorCheck[] = [];

  const majorNodeVersion = coerceMajorNodeVersion(process.version);
  checks.push({
    id: 'runtime.node.version',
    ok: majorNodeVersion >= 20,
    message: majorNodeVersion >= 20 ? `Node version ${process.version} is supported` : `Node version ${process.version} is below 20`,
    data: { version: process.version, major: majorNodeVersion },
  });

  const userAgent = process.env.npm_config_user_agent ?? '';
  const pnpmDetected = userAgent.includes('pnpm');
  checks.push({
    id: 'runtime.pnpm.detected',
    ok: pnpmDetected,
    message: pnpmDetected ? 'pnpm user agent detected' : 'pnpm user agent not detected',
    data: { npm_config_user_agent: userAgent },
  });

  const adapters = getAdapterRegistry();
  checks.push({
    id: 'adapters.registry.load',
    ok: adapters.length > 0,
    message: adapters.length > 0 ? `Loaded ${adapters.length} adapter(s)` : 'Adapter registry is empty',
    data: { count: adapters.length },
  });

  for (const adapter of adapters) {
    checks.push(checkAdapterContract(adapter));
  }

  checks.push(checkPackageResolvable('@spurprotocol/types'));
  checks.push(checkPackageResolvable('@spurprotocol/validator'));
  checks.push(checkPackageResolvable('@spurprotocol/compiler'));

  return checks;
}

export { getAdapterById, getAdapterRegistry } from './registry.js';
