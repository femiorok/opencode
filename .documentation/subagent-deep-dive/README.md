# Subagent System Deep Dive

Technical documentation of OpenCode's subagent architecture.

---

## What Are Subagents?

Subagents are specialized agents that primary agents spawn via the Task tool to handle discrete tasks. They run in isolated child sessions with restricted tool access and return structured results to their parent.

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERACTION                         │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PRIMARY AGENT (build)                     │
│  • Full tool access                                          │
│  • Visible in sidebar                                        │
│  • Can spawn subagents via Task tool                         │
└───────────┬─────────────────────────────────┬───────────────┘
            │                                 │
            ▼                                 ▼
┌───────────────────────┐         ┌───────────────────────────┐
│  SUBAGENT (explore)   │         │  SUBAGENT (general)       │
│  • Read-only tools    │         │  • Most tools enabled     │
│  • Hidden from UI     │         │  • No task spawning       │
└───────────────────────┘         └───────────────────────────┘
```

---

## Documents

| Document | Content |
|----------|---------|
| [Architecture](./architecture.md) | Session model, data structures, event system |
| [Implementation](./implementation.md) | Code walkthrough with file:line references |
| [Limitations](./limitations.md) | Known behaviors and constraints |

---

## Built-in Agents

| Name | Mode | Tool Restrictions |
|------|------|-------------------|
| `build` | primary | None |
| `plan` | primary | No edit, no write |
| `explore` | subagent | No edit, no write, no todo |
| `general` | subagent | No todo |

---

## Key Design Choices

| Choice | Rationale |
|--------|-----------|
| Session isolation | Enables parallel execution; prevents context pollution |
| No sub-subagents | Prevents infinite recursion; predictable depth |
| Hidden from sidebar | Reduces UI clutter from research tasks |
| Result summarization | Keeps parent context small |

---

## Key Files

| File | Purpose |
|------|---------|
| `packages/opencode/src/tool/task.ts` | Task tool implementation |
| `packages/opencode/src/session/index.ts` | Session creation and parentID |
| `packages/opencode/src/agent/agent.ts` | Agent definitions |
| `packages/opencode/src/session/processor.ts` | Message processing |
