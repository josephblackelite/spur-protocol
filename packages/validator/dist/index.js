import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import adapterContractSchema from '../../../schemas/AdapterContract.schema.json' with { type: 'json' };
import auditEventSchema from '../../../schemas/AuditEvent.schema.json' with { type: 'json' };
import executionPlanSchema from '../../../schemas/ExecutionPlan.schema.json' with { type: 'json' };
import governancePolicySchema from '../../../schemas/GovernancePolicy.schema.json' with { type: 'json' };
import robotProfileSchema from '../../../schemas/RobotProfile.schema.json' with { type: 'json' };
import skillDemonstrationSchema from '../../../schemas/SkillDemonstration.schema.json' with { type: 'json' };
import skillPackSchema from '../../../schemas/SkillPack.schema.json' with { type: 'json' };
import spurEnvelopeSchema from '../../../schemas/SpurEnvelope.schema.json' with { type: 'json' };
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validateSpurEnvelopeSchema = ajv.compile(spurEnvelopeSchema);
const validateSkillPackSchema = ajv.compile(skillPackSchema);
const validateGovernancePolicySchema = ajv.compile(governancePolicySchema);
const validateExecutionPlanSchema = ajv.compile(executionPlanSchema);
const validateRobotProfileSchema = ajv.compile(robotProfileSchema);
const validateAdapterContractSchema = ajv.compile(adapterContractSchema);
const validateAuditEventSchema = ajv.compile(auditEventSchema);
const validateSkillDemonstrationSchema = ajv.compile(skillDemonstrationSchema);
function formatAjvErrors(errors) {
    if (!errors || errors.length === 0) {
        return 'Unknown validation error';
    }
    return errors
        .map((error) => {
        const path = error.instancePath || '/';
        const message = error.message ?? 'validation failed';
        return `${path}: ${message}`;
    })
        .join('; ');
}
function assertValid(validate, data, schemaName) {
    if (validate(data)) {
        return;
    }
    throw new Error(`${schemaName} validation failed: ${formatAjvErrors(validate.errors)}`);
}
export function validateSpurEnvelope(data) {
    assertValid(validateSpurEnvelopeSchema, data, 'SpurEnvelope');
}
export function validateSkillPack(data) {
    assertValid(validateSkillPackSchema, data, 'SkillPack');
}
export function validateGovernancePolicy(data) {
    assertValid(validateGovernancePolicySchema, data, 'GovernancePolicy');
}
export function validateExecutionPlan(data) {
    assertValid(validateExecutionPlanSchema, data, 'ExecutionPlan');
}
export function validateRobotProfile(data) {
    assertValid(validateRobotProfileSchema, data, 'RobotProfile');
}
export function validateAdapterContract(data) {
    assertValid(validateAdapterContractSchema, data, 'AdapterContract');
}
export function validateAuditEvent(data) {
    assertValid(validateAuditEventSchema, data, 'AuditEvent');
}
export function validateSkillDemonstration(data) {
    assertValid(validateSkillDemonstrationSchema, data, 'SkillDemonstration');
}
//# sourceMappingURL=index.js.map