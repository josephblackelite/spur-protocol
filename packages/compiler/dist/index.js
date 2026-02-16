import { createHash } from 'node:crypto';
import { stableStringify } from './normalize.js';
function hasAllCapabilities(available, required) {
    return required.every((capability) => available.includes(capability));
}
export function compileExecutionPlan(params) {
    const envelope = params.envelope;
    const skill = params.skill;
    const policy = params.policy;
    const { robot } = params;
    if (!policy.allowedVerbs.includes(envelope.intent.verb)) {
        throw new Error(`Compilation failed: verb "${envelope.intent.verb}" is not allowed by policy "${policy.policyId}"`);
    }
    if (!hasAllCapabilities(skill.capabilitiesProvided, envelope.requiredCapabilities)) {
        throw new Error('Compilation failed: skill does not satisfy all required capabilities');
    }
    const robotCapabilities = Array.isArray(robot?.capabilities) ? robot.capabilities : [];
    if (!hasAllCapabilities(robotCapabilities, envelope.requiredCapabilities)) {
        throw new Error('Compilation failed: robot does not satisfy all required capabilities');
    }
    const planWithoutHash = {
        version: '0.1.0',
        planId: `${envelope.id}-plan`,
        sourceEnvelopeId: envelope.id,
        createdAt: envelope.issuedAt,
        steps: skill.steps,
        auditRequirements: policy.audit,
    };
    const normalizedPlan = stableStringify(planWithoutHash);
    const hash = createHash('sha256').update(normalizedPlan).digest('hex');
    return {
        ...planWithoutHash,
        hash,
    };
}
//# sourceMappingURL=index.js.map