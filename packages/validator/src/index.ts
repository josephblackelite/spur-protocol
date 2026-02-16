import Ajv2020 from 'ajv/dist/2020';
import type { ErrorObject, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

import { ExecutionPlan, GovernancePolicy, SkillPack, SpurEnvelope } from '@spur/types';

import executionPlanSchema from '../../../schemas/ExecutionPlan.schema.json';
import governancePolicySchema from '../../../schemas/GovernancePolicy.schema.json';
import skillPackSchema from '../../../schemas/SkillPack.schema.json';
import spurEnvelopeSchema from '../../../schemas/SpurEnvelope.schema.json';

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);

const validateSpurEnvelopeSchema = ajv.compile<SpurEnvelope>(spurEnvelopeSchema);
const validateSkillPackSchema = ajv.compile<SkillPack>(skillPackSchema);
const validateGovernancePolicySchema = ajv.compile<GovernancePolicy>(governancePolicySchema);
const validateExecutionPlanSchema = ajv.compile<ExecutionPlan>(executionPlanSchema);

function formatAjvErrors(errors: ErrorObject[] | null | undefined): string {
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

function assertValid<T>(validate: ValidateFunction<T>, data: unknown, schemaName: string): asserts data is T {
  if (validate(data)) {
    return;
  }

  throw new Error(`${schemaName} validation failed: ${formatAjvErrors(validate.errors)}`);
}

export function validateSpurEnvelope(data: unknown): asserts data is SpurEnvelope {
  assertValid<SpurEnvelope>(validateSpurEnvelopeSchema, data, 'SpurEnvelope');
}

export function validateSkillPack(data: unknown): asserts data is SkillPack {
  assertValid<SkillPack>(validateSkillPackSchema, data, 'SkillPack');
}

export function validateGovernancePolicy(data: unknown): asserts data is GovernancePolicy {
  assertValid<GovernancePolicy>(validateGovernancePolicySchema, data, 'GovernancePolicy');
}

export function validateExecutionPlan(data: unknown): asserts data is ExecutionPlan {
  assertValid<ExecutionPlan>(validateExecutionPlanSchema, data, 'ExecutionPlan');
}
