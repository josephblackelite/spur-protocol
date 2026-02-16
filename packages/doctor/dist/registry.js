const ADAPTER_REGISTRY = [
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
export function getAdapterRegistry() {
    return ADAPTER_REGISTRY.map((adapter) => structuredClone(adapter));
}
export function getAdapterById(adapterId) {
    const adapter = ADAPTER_REGISTRY.find((item) => item.adapterId === adapterId);
    return adapter ? structuredClone(adapter) : undefined;
}
//# sourceMappingURL=registry.js.map