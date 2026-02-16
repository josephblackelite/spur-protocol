function includesValue(values, value) {
    return values.includes(value);
}
export function evaluateEnforcement(params) {
    const envelope = params.envelope;
    const policy = params.policy;
    const robot = params.robot;
    const adapter = params.adapter;
    if (!includesValue(policy.allowedVerbs, envelope.intent.verb)) {
        return {
            mode: 'DENY',
            reason: `Verb '${envelope.intent.verb}' is not allowed by policy '${policy.policyId}'`,
        };
    }
    const missingCapabilities = envelope.requiredCapabilities.filter((capability) => !includesValue(robot.capabilities, capability));
    if (missingCapabilities.length > 0) {
        return {
            mode: 'DENY',
            reason: `Robot is missing required capabilities: ${missingCapabilities.join(', ')}`,
        };
    }
    const missingAdapterCapabilities = envelope.requiredCapabilities.filter((capability) => !includesValue(adapter.supportedCapabilities, capability));
    if (!includesValue(adapter.supportedVerbs, envelope.intent.verb) || missingAdapterCapabilities.length > 0) {
        return {
            mode: 'DENY',
            reason: 'Adapter cannot execute the requested envelope requirements',
        };
    }
    const speedLimitConfigured = typeof policy.limits === 'object' && policy.limits !== null && 'speedLimit' in policy.limits;
    if (speedLimitConfigured && adapter.constraintSupport.speedLimit !== true) {
        return {
            mode: 'DENY',
            reason: 'Policy speed limit cannot be enforced by adapter',
        };
    }
    return {
        mode: 'ALLOW',
        reason: 'Envelope is runnable with the provided policy, robot, and adapter',
    };
}
export function explainWhyNotRunnable(params) {
    const decision = evaluateEnforcement(params);
    if (decision.mode === 'ALLOW') {
        return {
            ok: true,
            decision,
            missingCapabilities: [],
            policyIssues: [],
            adapterIssues: [],
            suggestedFixes: [],
        };
    }
    const envelope = params.envelope;
    const policy = params.policy;
    const robot = params.robot;
    const adapter = params.adapter;
    const missingCapabilities = envelope.requiredCapabilities.filter((capability) => !includesValue(robot.capabilities, capability));
    const policyIssues = [];
    if (!includesValue(policy.allowedVerbs, envelope.intent.verb)) {
        policyIssues.push(`Verb '${envelope.intent.verb}' is not allowed by GovernancePolicy.allowedVerbs`);
    }
    const adapterIssues = [];
    if (!includesValue(adapter.supportedVerbs, envelope.intent.verb)) {
        adapterIssues.push(`Adapter does not support verb '${envelope.intent.verb}'`);
    }
    const missingAdapterCapabilities = envelope.requiredCapabilities.filter((capability) => !includesValue(adapter.supportedCapabilities, capability));
    for (const capability of missingAdapterCapabilities) {
        adapterIssues.push(`Adapter does not support capability '${capability}'`);
    }
    const speedLimitConfigured = typeof policy.limits === 'object' && policy.limits !== null && 'speedLimit' in policy.limits;
    if (speedLimitConfigured && adapter.constraintSupport.speedLimit !== true) {
        adapterIssues.push('Adapter cannot enforce policy speed limit');
    }
    const suggestedFixes = [];
    for (const capability of missingCapabilities) {
        suggestedFixes.push(`Add capability '${capability}' to RobotProfile.capabilities`);
    }
    if (!includesValue(policy.allowedVerbs, envelope.intent.verb)) {
        suggestedFixes.push(`Add verb '${envelope.intent.verb}' to GovernancePolicy.allowedVerbs`);
    }
    if (!includesValue(adapter.supportedVerbs, envelope.intent.verb)) {
        suggestedFixes.push(`Use an adapter that supports verb '${envelope.intent.verb}'`);
    }
    for (const capability of missingAdapterCapabilities) {
        suggestedFixes.push(`Use an adapter that supports capability '${capability}'`);
    }
    if (speedLimitConfigured && adapter.constraintSupport.speedLimit !== true) {
        suggestedFixes.push('Use an adapter with constraintSupport.speedLimit = true');
    }
    return {
        ok: false,
        decision,
        missingCapabilities,
        policyIssues,
        adapterIssues,
        suggestedFixes,
    };
}
//# sourceMappingURL=index.js.map