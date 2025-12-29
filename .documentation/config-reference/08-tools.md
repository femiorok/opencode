# Tools

## `tools`

**Type:** `Record<string, boolean>`

Globally enable or disable specific tools. This is different from permissions—disabled tools aren't even available to the AI. The AI won't know they exist and can't attempt to use them.

```json
{
  "tools": {
    "webfetch": false,
    "bash": false
  }
}
```

---

## Built-in Tools

| Tool | Description |
|------|-------------|
| `read` | Read file contents |
| `write` | Create new files |
| `edit` | Modify existing files |
| `glob` | Find files by pattern (e.g., `**/*.ts`) |
| `grep` | Search file contents with regex |
| `bash` | Execute shell commands |
| `webfetch` | Fetch content from URLs |
| `task` | Spawn subagents for parallel work |
| `todoread` | Read the current todo list |
| `todowrite` | Create and manage todo items |
| `skill` | Execute skills and commands |

---

## Tools vs Permissions

**Tools** (`tools`): Controls whether a tool exists at all.
- When disabled, the AI doesn't know the tool exists
- Cannot be used under any circumstances
- Use for hard restrictions

**Permissions** (`permission`): Controls whether a tool requires approval.
- Tool exists and AI can attempt to use it
- User approves/denies each use
- Use for oversight without blocking

**Example comparison:**

```json
{
  // Tool disabled - AI can't even try to use bash
  "tools": {
    "bash": false
  }
}
```

```json
{
  // Tool enabled but requires approval
  "permission": {
    "bash": "ask"
  }
}
```

---

## When to Disable Tools

### `bash: false`
For read-only analysis where you don't want any command execution:
- Security audits where you're reviewing code
- When you want pure analysis without side effects
- Environments where shell access is restricted

### `webfetch: false`
For offline or air-gapped environments:
- Corporate networks without internet access
- When you don't want external data fetched
- Privacy-sensitive contexts

### `write: false`
For review-only sessions:
- Code review where you only want suggestions
- Learning/exploration without modifications
- When paired with `edit: false` for complete read-only mode

### `task: false`
To prevent subagent spawning:
- When you want all work in a single conversation
- To reduce API costs from parallel agents
- For simpler, more predictable behavior

---

## Agent-Level Tool Configuration

Tools can also be configured per-agent:

```json
{
  "agent": {
    "analyst": {
      "description": "Analyzes code without making changes",
      "tools": {
        "write": false,
        "edit": false,
        "bash": false
      }
    }
  }
}
```

Agent-level tool settings override global settings for that specific agent.

---

## Practical Examples

### Read-Only Analysis Mode
```json
{
  "tools": {
    "write": false,
    "edit": false,
    "bash": false
  }
}
```

### Minimal Tools for Simple Tasks
```json
{
  "tools": {
    "task": false,
    "webfetch": false
  }
}
```

### Everything Enabled (Default)
```json
{
  "tools": {
    "read": true,
    "write": true,
    "edit": true,
    "glob": true,
    "grep": true,
    "bash": true,
    "webfetch": true,
    "task": true,
    "todoread": true,
    "todowrite": true,
    "skill": true
  }
}
```
