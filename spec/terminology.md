# Terminology

## Core objects

### Task Envelope (SpurEnvelope)
Structured input describing the intended task context, objectives, and operational constraints for planning and execution.

### Skill Pack (SkillPack)
Portable package describing executable robotics capabilities, required interfaces, and metadata needed by a runtime.

### Governance Policy (GovernancePolicy)
Policy definition that constrains planning and execution through safety, compliance, and operational rules.

### Execution Plan (ExecutionPlan)
Resolved, runtime-ready plan produced from task intent, available skills, and applicable policy constraints.

Task Envelope + Skill Pack + Governance Policy -> Execution Plan -> Fleet Runtime


## Supporting terms

### Robot Profile (RobotProfile)
Supporting schema that describes robot-specific capabilities, limits, and adapters used during plan compilation.

## Legacy term mapping

- Mission envelope -> Task Envelope (SpurEnvelope)
- Mission export -> Execution Plan (ExecutionPlan)
- Capability envelope -> Robot Profile
