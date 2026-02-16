import type { AdapterContract, EnforcementDecision, GovernancePolicy, RobotProfile, SpurEnvelope } from '@spurprotocol/types';
export type ExplainReport = {
    ok: boolean;
    decision: EnforcementDecision;
    missingCapabilities: string[];
    policyIssues: string[];
    adapterIssues: string[];
    suggestedFixes: string[];
};
export declare function evaluateEnforcement(params: {
    envelope: SpurEnvelope;
    policy: GovernancePolicy;
    robot: RobotProfile;
    adapter: AdapterContract;
}): EnforcementDecision;
export declare function explainWhyNotRunnable(params: {
    envelope: SpurEnvelope;
    policy: GovernancePolicy;
    robot: RobotProfile;
    adapter: AdapterContract;
}): ExplainReport;
//# sourceMappingURL=index.d.ts.map