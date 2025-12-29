# Experimental Features

## `experimental`

**Type:** `ExperimentalConfig`

Features that are still being developed. These may change or be removed in future versions.

```json
{
  "experimental": {
    "chatMaxRetries": 3,
    "disable_paste_summary": false,
    "batch_tool": false,
    "openTelemetry": false,
    "primary_tools": ["todowrite"],
    "continue_loop_on_deny": false,
    "hook": {
      "file_edited": {
        "*.ts": [
          {
            "command": ["eslint", "--fix", "$FILE"],
            "environment": {}
          }
        ]
      },
      "session_completed": [
        {
          "command": ["notify-send", "OpenCode", "Session completed"],
          "environment": {}
        }
      ]
    }
  }
}
```

---

## Options

### `chatMaxRetries`

**Type:** `number`

Number of times to retry failed API calls before giving up.

```json
{
  "experimental": {
    "chatMaxRetries": 5
  }
}
```

Useful for handling transient network issues or rate limits.

### `disable_paste_summary`

**Type:** `boolean`
**Default:** `false`

When you paste large content (>150 chars or 3+ lines), OpenCode normally shows a summary. Set to `true` to show full pasted content instead.

```json
{
  "experimental": {
    "disable_paste_summary": true
  }
}
```

### `batch_tool`

**Type:** `boolean`
**Default:** `false`

Enable experimental batch tool that allows grouping multiple operations.

```json
{
  "experimental": {
    "batch_tool": true
  }
}
```

### `openTelemetry`

**Type:** `boolean`
**Default:** `false`

Enable OpenTelemetry tracing for AI SDK calls.

```json
{
  "experimental": {
    "openTelemetry": true
  }
}
```

Useful for:
- Debugging and performance monitoring
- Integration with observability platforms
- Understanding AI call patterns

### `primary_tools`

**Type:** `string[]`

Tools that should only be available to primary agents, not subagents.

```json
{
  "experimental": {
    "primary_tools": ["todowrite", "todoread"]
  }
}
```

Useful for restricting certain capabilities to the main conversation.

### `continue_loop_on_deny`

**Type:** `boolean`
**Default:** `false`

When a tool call is denied (via permissions), normally the agent loop stops. Set to `true` to let the agent continue and try alternative approaches.

```json
{
  "experimental": {
    "continue_loop_on_deny": true
  }
}
```

---

## Experimental Hooks

Hooks let you run custom commands in response to events.

### `hook.file_edited`

**Type:** `Record<glob, HookAction[]>`

Run commands when files matching a pattern are edited.

```json
{
  "experimental": {
    "hook": {
      "file_edited": {
        "*.py": [
          { "command": ["black", "$FILE"] },
          { "command": ["mypy", "$FILE"] }
        ],
        "*.ts": [
          { "command": ["eslint", "--fix", "$FILE"] }
        ],
        "*.go": [
          { "command": ["gofmt", "-w", "$FILE"] }
        ]
      }
    }
  }
}
```

**Variables:**
- `$FILE`: The path to the edited file

### `hook.session_completed`

**Type:** `HookAction[]`

Run commands when a session finishes (goes idle).

```json
{
  "experimental": {
    "hook": {
      "session_completed": [
        {
          "command": ["osascript", "-e", "display notification \"Session done\" with title \"OpenCode\""],
          "environment": {}
        }
      ]
    }
  }
}
```

**Use cases:**
- Desktop notifications when work is done
- Triggering builds after changes
- Logging session completion
- Sending Slack/Discord messages

---

## HookAction Format

```typescript
{
  command: string[]                    // Command and arguments
  environment?: Record<string, string> // Optional environment variables
}
```

**Examples:**

```json
{
  "command": ["npm", "run", "lint"],
  "environment": {
    "NODE_ENV": "development"
  }
}
```

```json
{
  "command": ["curl", "-X", "POST", "https://webhook.example.com"],
  "environment": {}
}
```

---

## Hook Patterns

### Auto-Format on Save

```json
{
  "experimental": {
    "hook": {
      "file_edited": {
        "*.ts": [{ "command": ["npx", "prettier", "--write", "$FILE"] }],
        "*.tsx": [{ "command": ["npx", "prettier", "--write", "$FILE"] }],
        "*.py": [{ "command": ["black", "$FILE"] }],
        "*.go": [{ "command": ["gofmt", "-w", "$FILE"] }]
      }
    }
  }
}
```

### Run Tests After Changes

```json
{
  "experimental": {
    "hook": {
      "file_edited": {
        "src/**/*.ts": [{ "command": ["npm", "test", "--", "--related", "$FILE"] }]
      }
    }
  }
}
```

### macOS Notification on Completion

```json
{
  "experimental": {
    "hook": {
      "session_completed": [
        {
          "command": ["osascript", "-e", "display notification \"OpenCode task completed\" with title \"OpenCode\""]
        }
      ]
    }
  }
}
```

### Linux Notification on Completion

```json
{
  "experimental": {
    "hook": {
      "session_completed": [
        {
          "command": ["notify-send", "OpenCode", "Task completed"]
        }
      ]
    }
  }
}
```
