import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import executionPlanSchema from '../../../schemas/ExecutionPlan.schema.json';
import governancePolicySchema from '../../../schemas/GovernancePolicy.schema.json';
import robotProfileSchema from '../../../schemas/RobotProfile.schema.json';
import skillPackSchema from '../../../schemas/SkillPack.schema.json';
import spurEnvelopeSchema from '../../../schemas/SpurEnvelope.schema.json';
export type SpurEnvelope = FromSchema<(typeof spurEnvelopeSchema) & JSONSchema>;
export type SkillPack = FromSchema<(typeof skillPackSchema) & JSONSchema>;
export type GovernancePolicy = FromSchema<(typeof governancePolicySchema) & JSONSchema>;
export type ExecutionPlan = FromSchema<(typeof executionPlanSchema) & JSONSchema>;
export type RobotProfile = FromSchema<(typeof robotProfileSchema) & JSONSchema>;
//# sourceMappingURL=index.d.ts.map