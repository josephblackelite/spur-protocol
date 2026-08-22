// Generates site/public/data/objects.json directly from the real schemas/
// and examples/ in this repo -- never hand-copy schema content into the
// site. Run this before every deploy (and whenever a schema changes) so
// the site can't silently drift from what the protocol actually says.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');
const schemasDir = join(repoRoot, 'schemas');
const examplesDir = join(repoRoot, 'examples');
const outDir = join(here, 'public', 'data');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function fieldSummary(schema) {
  const props = schema.properties || {};
  const required = new Set(schema.required || []);
  return Object.keys(props).map((name) => {
    const p = props[name];
    let type = p.const ? `const "${p.const}"` : p.type || (p.enum ? 'enum' : 'object');
    if (Array.isArray(type)) type = type.join(' | ');
    if (p.type === 'array' && p.items) {
      const itemType = p.items.type || (p.items.properties ? 'object' : 'string');
      type = `${itemType}[]`;
    }
    return {
      name,
      type,
      required: required.has(name),
      description: p.description || null,
    };
  });
}

// tier: "core" objects flow through compileExecutionPlan (Task Envelope +
// SkillPack + GovernancePolicy -> ExecutionPlan -> Runtime). "supporting"
// objects inform or record that pipeline without being compiled inputs
// themselves -- matches spec/terminology.md exactly, not a design choice
// made for this site.
const OBJECTS = [
  {
    id: 'SpurEnvelope',
    tier: 'core',
    title: 'Task Envelope',
    tagline: 'What a robot is being asked to do, and under what constraints.',
    description:
      'Structured input describing the intended task context, objectives, and operational constraints for planning and execution.',
    schemaFile: 'SpurEnvelope.schema.json',
    exampleFile: 'envelope.clean.json',
  },
  {
    id: 'SkillPack',
    tier: 'core',
    title: 'Skill Pack',
    tagline: 'A portable, executable capability a robot can run.',
    description:
      'Portable package describing executable robotics capabilities, required interfaces, and metadata needed by a runtime.',
    schemaFile: 'SkillPack.schema.json',
    exampleFile: 'skill.clean-bathroom.json',
  },
  {
    id: 'GovernancePolicy',
    tier: 'core',
    title: 'Governance Policy',
    tagline: 'What a fleet is allowed to do, and the limits it must obey.',
    description:
      'Policy definition that constrains planning and execution through safety, compliance, and operational rules.',
    schemaFile: 'GovernancePolicy.schema.json',
    exampleFile: 'policy.default.json',
  },
  {
    id: 'ExecutionPlan',
    tier: 'core',
    title: 'Execution Plan',
    tagline: 'The resolved, hashed, runtime-ready output of the compiler.',
    description:
      'Resolved, runtime-ready plan produced from task intent, available skills, and applicable policy constraints.',
    schemaFile: 'ExecutionPlan.schema.json',
    exampleFile: 'plan.generated.json',
  },
  {
    id: 'RobotProfile',
    tier: 'supporting',
    title: 'Robot Profile',
    tagline: 'What a specific robot can actually do.',
    description:
      'Supporting schema that describes robot-specific capabilities, limits, and adapters used during plan compilation.',
    schemaFile: 'RobotProfile.schema.json',
    exampleFile: 'robot.default.json',
  },
  {
    id: 'AdapterContract',
    tier: 'supporting',
    title: 'Adapter Contract',
    tagline: 'How an Execution Plan gets translated into a specific fleet runtime.',
    description:
      'Declares an adapter’s supported verbs, capabilities, constraint enforcement, and audit obligations for a target interop context (ROS2, VDA 5050, or a vendor API).',
    schemaFile: 'AdapterContract.schema.json',
    exampleFile: 'adapter.sim.json',
  },
  {
    id: 'AuditEvent',
    tier: 'supporting',
    title: 'Audit Event',
    tagline: 'The append-only, replayable record of what actually happened.',
    description:
      'A single entry in the append-only audit trail a conformant Fleet Runtime must emit for every plan and step lifecycle transition.',
    schemaFile: 'AuditEvent.schema.json',
    exampleFile: 'audit.plan-started.json',
  },
  {
    id: 'SkillDemonstration',
    tier: 'supporting',
    title: 'Skill Demonstration',
    tagline: 'A verified human demonstration, signed and ready to license.',
    description:
      'Records a human demonstrating a SkillPack’s task -- media references, a consent/licensing grant, and a review status -- signed with the contributor’s own Ed25519 key. Independent of the core compilation pipeline.',
    schemaFile: 'SkillDemonstration.schema.json',
    exampleFile: 'demonstration.sample.json',
  },
];

const objects = OBJECTS.map((obj) => {
  const schema = readJson(join(schemasDir, obj.schemaFile));
  const example = readJson(join(examplesDir, obj.exampleFile));
  return {
    id: obj.id,
    tier: obj.tier,
    title: obj.title,
    tagline: obj.tagline,
    description: obj.description,
    version: schema.properties?.version?.const || null,
    fields: fieldSummary(schema),
    schemaId: schema.$id,
    example,
  };
});

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'objects.json'), JSON.stringify({ generatedAt: new Date().toISOString(), objects }, null, 2));
console.log(`Wrote ${objects.length} objects to site/public/data/objects.json`);
