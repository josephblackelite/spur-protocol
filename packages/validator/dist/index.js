import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import executionPlanSchema from '../../../schemas/ExecutionPlan.schema.json';
import governancePolicySchema from '../../../schemas/GovernancePolicy.schema.json';
import skillPackSchema from '../../../schemas/SkillPack.schema.json';
import spurEnvelopeSchema from '../../../schemas/SpurEnvelope.schema.json';
const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validateSpurEnvelopeSchema = ajv.compile(spurEnvelopeSchema);
const validateSkillPackSchema = ajv.compile(skillPackSchema);
const validateGovernancePolicySchema = ajv.compile(governancePolicySchema);
const validateExecutionPlanSchema = ajv.compile(executionPlanSchema);
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
//# sourceMappingURL=index.js.map