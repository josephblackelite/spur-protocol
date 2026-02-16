import type { AdapterContract } from '@spurprotocol/types';

type AdapterRecord = {
  version: '0.1.0';
  adapterId: string;
  name: string;
  interopContexts: string[];
  supportedVerbs: string[];
  supportedCapabilities: string[];
  constraintSupport: {
    speedLimit: boolean;
    forceLimit: boolean;
    zoneEnforcement: boolean;
    approvalGates: boolean;
  };
  auditSupport: {
    emitsAuditEvents: true;
    minimumEventSet: string[];
  };
  endpoint: {
    type: string;
    uri: string;
  };
};

const ADAPTER_REGISTRY: AdapterRecord[] = [
  {
    version: '0.1.0',
    adapterId: 'adapter-sim-http-01',
    name: 'Simulation + HTTP Adapter',
    interopContexts: ['SIM', 'HTTP_API'],
    supportedVerbs: ['clean', 'navigate', 'dock'],
    supportedCapabilities: ['mapping', 'obstacle-avoidance', 'task-queue'],
    constraintSupport: {
      speedLimit: true,
      forceLimit: false,
      zoneEnforcement: true,
      approvalGates: true,
    },
    auditSupport: {
      emitsAuditEvents: true,
      minimumEventSet: ['PLAN_STARTED', 'STEP_STARTED', 'STEP_COMPLETED', 'PLAN_COMPLETED'],
    },
    endpoint: {
      type: 'http',
      uri: 'https://adapter.example.internal/v1/execute',
    },
  },
];

export function getAdapterRegistry(): AdapterContract[] {
  return ADAPTER_REGISTRY.map((adapter) => structuredClone(adapter) as AdapterContract);
}

export function getAdapterById(adapterId: string): AdapterContract | undefined {
  const adapter = ADAPTER_REGISTRY.find((item) => item.adapterId === adapterId);
  return adapter ? (structuredClone(adapter) as AdapterContract) : undefined;
}
