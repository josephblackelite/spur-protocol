# Overview

Spur Protocol defines a standards-oriented model for composing autonomous robotics workflows from four canonical objects: Task Envelope (SpurEnvelope), Skill Pack (SkillPack), Governance Policy (GovernancePolicy), and Execution Plan (ExecutionPlan).

A Task Envelope captures intent and context. A Skill Pack contributes executable capabilities. A Governance Policy constrains allowable behavior. Together these inputs produce an Execution Plan for a target runtime environment.

```text
Task Envelope + SkillPack + Governance Policy -> ExecutionPlan -> Runtime
```

Adapters may translate Execution Plans into platform-specific commands for Interop Contexts such as ROS2, VDA 5050, or vendor APIs, while preserving protocol semantics.
