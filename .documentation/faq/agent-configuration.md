# Agent Configuration & Defaults

## How do I change the default agent?

The default agent is set via the `default_agent` config option:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "default_agent": "plan"
}
```

**Requirements:**
- The agent must be a **primary agent** (not a subagent like "explore")
- Built-in primary agents: `build`, `plan`
- If the specified agent doesn't exist or is a subagent, OpenCode falls back to `build`

**Config file locations:**
- Global: `~/.config/opencode/opencode.json`
- Project: `opencode.json` in project root

---

## Why is "build" hardcoded as the default?

When no `default_agent` is configured, OpenCode defaults to `"build"`. This is defined in `packages/opencode/src/agent/agent.ts`:

```typescript
const defaultName = cfg.default_agent ?? "build"
```

The `build` agent is designed as the general-purpose coding agent, making it the sensible default for most tasks.

---

## How do I customize agent models?

Each agent can use a different model. Configure in your `opencode.json`:

```json
{
  "agent": {
    "plan": {
      "model": "anthropic/claude-opus-4-20250514"
    },
    "build": {
      "model": "anthropic/claude-sonnet-4-20250514"
    },
    "explore": {
      "model": "mistral/mistral-large-latest"
    },
    "title": {
      "model": "anthropic/claude-3-haiku-20240307"
    },
    "summary": {
      "model": "anthropic/claude-3-haiku-20240307"
    }
  }
}
```

**All configurable agents:**
- `plan` - Planning agent
- `build` - Primary coding agent (default)
- `explore` - Codebase exploration (subagent)
- `title` - Session title generation
- `summary` - Conversation summarization
- `compaction` - Context compaction

---

## Can I set a project-specific default agent?

Yes. Create an `opencode.json` in your project root:

```json
{
  "default_agent": "plan"
}
```

Project config overrides global config.

---

## How do I create a custom agent?

Create a markdown file in `~/.config/opencode/agent/` or `.opencode/agent/`:

```markdown
---
description: A specialized agent for database work
mode: primary
model: anthropic/claude-sonnet-4-20250514
temperature: 0.3
tools:
  bash: true
  edit: true
  read: true
permission:
  edit: allow
  bash:
    "*": ask
---

You are a database specialist. Focus on SQL optimization, schema design, and data migrations.

When working with databases:
1. Always check existing schema first
2. Use transactions for data modifications
3. Include rollback strategies
```

**Frontmatter options:**

| Field | Description |
|-------|-------------|
| `description` | Shown in agent picker |
| `mode` | `primary` (top-level) or `subagent` (spawnable) |
| `model` | Model to use (provider/model format) |
| `temperature` | Creativity (0.0-1.0) |
| `tools` | Enable/disable specific tools |
| `permission` | Permission presets for tools |
| `color` | Display color in UI |
| `maxSteps` | Maximum reasoning steps |

---

## Why aren't agent descriptions shown in autocomplete?

Agent descriptions appear in the agent selection dialog (`Ctrl+J` or `/agent`), but may not appear in the command autocomplete due to space constraints.

To see all agents with descriptions:
1. Press `Ctrl+J` to open agent picker
2. Or use `/agent` command

---

## How do I configure agent permissions?

```json
{
  "agent": {
    "build": {
      "permission": {
        "edit": "allow",           // allow, ask, or deny
        "bash": {
          "*": "ask",              // Default for all commands
          "npm test": "allow",     // Specific command override
          "rm -rf": "deny"
        },
        "webfetch": "ask",
        "external_directory": "deny"
      }
    }
  }
}
```

**Permission types:**
- `edit` - File editing
- `bash` - Shell command execution (supports pattern matching)
- `skill` - Skill invocation (v2)
- `webfetch` - Web fetching
- `doom_loop` - Automatic retry loops
- `external_directory` - Access outside project

---

## What's the difference between primary and subagent modes?

| Aspect | Primary (`mode: "primary"`) | Subagent (`mode: "subagent"`) |
|--------|----------------------------|-------------------------------|
| Selection | Available in agent picker | Only spawnable via Task tool |
| Default | Can be `default_agent` | Cannot be default |
| Sidebar | Shows in session list | Hidden from sidebar |
| Tools | Full tool access | Restricted (no task, todowrite) |
| Use case | User-facing work | Background/parallel tasks |

Built-in subagents: `explore`, `general`
