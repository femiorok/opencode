# Agents

Agents are specialized AI personas with different system prompts, tool access, and behaviors. They let you create purpose-built assistants for different tasks.

## `agent`

**Type:** `Record<string, AgentConfig>`

Configure built-in agents or create custom ones.

```jsonc
{
  "agent": {
    // Override built-in agent settings
    "build": {
      "model": "anthropic/claude-opus-4",
      "temperature": 0.3
    },

    // Create a custom agent
    "security-reviewer": {
      "description": "Reviews code for security vulnerabilities and OWASP top 10 issues",
      "model": "anthropic/claude-sonnet-4-5",
      "prompt": "You are a security expert. Review code for vulnerabilities including injection attacks, authentication issues, data exposure, and other OWASP top 10 concerns. Be thorough but practical.",
      "mode": "subagent",
      "color": "#FF4444",
      "maxSteps": 30,
      "tools": {
        "write": false,
        "edit": false,
        "bash": false
      }
    }
  }
}
```

---

## Agent Configuration Options

### `model`
**Type:** `string`

Override the default model for this agent. Useful for:
- Using a more capable model for complex agents (e.g., opus for architecture planning)
- Using a cheaper model for simple agents (e.g., haiku for quick tasks)

### `temperature`
**Type:** `number` (0-2)

Controls randomness in responses.
- `0.0-0.3`: More deterministic, focused. Good for code generation.
- `0.4-0.7`: Balanced. Good for general tasks.
- `0.8-1.0`: More creative, varied. Good for brainstorming.
- `>1.0`: Very random. Rarely useful.

### `top_p`
**Type:** `number` (0-1)

Nucleus sampling parameter. Alternative to temperature for controlling randomness. Usually you set one or the other, not both.

### `prompt`
**Type:** `string`

The system prompt that defines the agent's personality and behavior. This is the most important field for custom agents. Write clear instructions about:
- What the agent's role is
- What it should focus on
- Any constraints or guidelines
- Output format preferences

### `description`
**Type:** `string`

A short description of when to use this agent. This is shown in the agent picker and helps users (and potentially auto-selection features) understand the agent's purpose.

### `mode`
**Type:** `"primary" | "subagent" | "all"`

Determines where this agent can be used.
- `"primary"`: Can be selected as the main agent. Appears in agent picker. Can be set as `default_agent`.
- `"subagent"`: Can only be invoked by other agents via the Task tool. Does not appear in the main agent picker.
- `"all"`: Available both as primary and subagent.

### `color`
**Type:** `string`

Hex color code (e.g., `#FF5733`) for visual identification in the UI. Helps distinguish between agents when switching or viewing agent activity.

### `maxSteps`
**Type:** `number`

Maximum number of tool-use iterations before forcing a text-only response. Prevents runaway agents from using excessive API calls.
- Default varies by agent type
- Set lower for agents that should give quick answers
- Set higher for agents that need to do extensive work

### `disable`
**Type:** `boolean`

Set to `true` to disable this agent without removing its configuration.

### `tools`
**Type:** `Record<string, boolean>`

Enable or disable specific tools for this agent.

```json
{
  "tools": {
    "write": false,    // Can't create new files
    "edit": false,     // Can't edit files
    "bash": false,     // Can't run commands
    "read": true,      // Can read files (default: true)
    "glob": true,      // Can search for files (default: true)
    "grep": true       // Can search file contents (default: true)
  }
}
```

### `permission`
**Type:** `PermissionConfig`

Agent-specific permission overrides. See [Permissions](./07-permissions.md) for details.

---

## Built-in Agents

| Agent | Mode | Purpose |
|-------|------|---------|
| `build` | primary | Default coding agent. Full access to all tools. Best for implementation. |
| `plan` | primary | Planning mode. Focuses on understanding and planning before implementation. |
| `general` | subagent | General-purpose subagent for delegated tasks. |
| `explore` | subagent | Specialized for codebase exploration and understanding. |
| `title` | specialized | Generates session titles. Uses small_model. |
| `summary` | specialized | Generates summaries. Uses small_model. |
| `compaction` | specialized | Handles context compaction when conversations get long. |

---

## Defining Agents via Markdown Files

Instead of JSON config, you can define agents as markdown files in:
- `~/.config/opencode/agent/` (global)
- `.opencode/agent/` (project-specific)

**Example:** `.opencode/agent/reviewer.md`
```markdown
---
description: Reviews pull requests for code quality
model: anthropic/claude-sonnet-4-5
mode: subagent
color: "#4CAF50"
tools:
  write: false
  edit: false
---

You are a code reviewer. When reviewing code:

1. Check for bugs and logic errors
2. Evaluate code style and consistency
3. Look for performance issues
4. Suggest improvements

Be constructive and specific in your feedback.
```

The YAML frontmatter contains the configuration, and the markdown body becomes the `prompt`.

---

## `mode` (Deprecated)

**Type:** `Record<string, AgentConfig>`

This field is deprecated. Use `agent` instead. Any modes defined here are automatically migrated to agents with `mode: "primary"`.
