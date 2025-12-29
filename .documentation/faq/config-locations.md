# Configuration File Location & Structure

## Where does OpenCode look for configuration?

OpenCode scans multiple locations in a specific order, with later files overriding earlier ones.

### Global Configuration

| Platform | Path |
|----------|------|
| Linux | `~/.config/opencode/` |
| macOS | `~/.config/opencode/` (XDG) or `~/Library/Application Support/opencode/` |
| All | `~/.opencode/` (fallback) |

**Files scanned in global directories:**
- `config.json`
- `opencode.json`
- `opencode.jsonc`

### Project Configuration

OpenCode walks up from the current directory to the git root, looking for:
- `opencode.json`
- `opencode.jsonc`
- `.opencode/` directory

### Loading Order (later overrides earlier)

1. `{XDG_CONFIG_HOME}/opencode/config.json`
2. `{XDG_CONFIG_HOME}/opencode/opencode.json`
3. `{XDG_CONFIG_HOME}/opencode/opencode.jsonc`
4. `./opencode.json` (project root)
5. `./opencode.jsonc` (project root)
6. `./.opencode/opencode.json`
7. `~/.opencode/opencode.json`
8. Environment: `OPENCODE_CONFIG` (path to custom config file)
9. Environment: `OPENCODE_CONFIG_CONTENT` (JSON string)

---

## Why do docs mention both `~/.opencode/` and `~/.config/opencode/`?

**Both paths are valid.** OpenCode scans both locations for configuration components.

The system checks:
1. XDG config directory (`~/.config/opencode/` on most systems)
2. Home directory fallback (`~/.opencode/`)
3. Project-local (`.opencode/` in your project)

For consistency, we recommend using `~/.config/opencode/` for global configuration.

---

## Where do I put custom agents, commands, and plugins?

### Directory Structure

```
~/.config/opencode/           # Global (recommended)
├── opencode.json             # Global config
├── agent/                    # Custom agents
│   └── my-agent.md
├── command/                  # Custom commands
│   └── my-command.md
└── plugin/                   # Custom plugins
    └── my-plugin.ts

.opencode/                    # Project-local
├── opencode.json             # Project config
├── agent/
├── command/
└── plugin/
```

**Important:** Use singular names (`agent/`, `command/`, `plugin/`), not plural. OpenCode will warn you if you use `agents/`, `commands/`, or `plugins/`.

---

## What config options are undocumented?

### Compaction Settings

```json
{
  "compaction": {
    "auto": true,        // Automatically compact long conversations
    "prune": false       // Remove old compacted content
  }
}
```

### Watcher Ignore Patterns

```json
{
  "watcher": {
    "ignore": ["**/node_modules/**", "**/.git/**"]
  }
}
```

### Experimental Features

```json
{
  "experimental": {
    "parallel_tool_calls": true,      // Allow parallel tool execution
    "no_file_diff": false,            // Disable file diff display
    "continue_loop_on_deny": false    // Continue after permission denial
  }
}
```

---

## How do I configure custom models?

### Basic Model Override

```json
{
  "model": "anthropic/claude-sonnet-4-20250514"
}
```

### Custom Model with Different Settings

Use the `id` property to reference the underlying API model while using a custom key:

```json
{
  "provider": {
    "anthropic": {
      "models": {
        "claude-opus-thinking": {
          "id": "claude-opus-4-20250514",
          "name": "Claude Opus (Thinking)",
          "options": {
            "thinking": {
              "type": "enabled",
              "budget_tokens": 10000
            }
          }
        },
        "claude-opus-fast": {
          "id": "claude-opus-4-20250514",
          "name": "Claude Opus (Fast)",
          "options": {
            "thinking": {
              "type": "disabled"
            }
          }
        }
      }
    }
  }
}
```

Key properties:
- `id` - The actual API model ID (required when key differs from model name)
- `name` - Display name in UI (optional, uses key if not set)
- `options` - Model-specific options

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `OPENCODE_CONFIG` | Path to custom config file |
| `OPENCODE_CONFIG_CONTENT` | JSON config string (used by SDK) |
| `OPENCODE_CONFIG_DIR` | Additional directory to scan |

### Config Value Substitution

Config files support variable substitution:

```json
{
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "{env:ANTHROPIC_API_KEY}"
      }
    }
  }
}
```

- `{env:VARIABLE_NAME}` - Environment variable value
- `{file:path/to/file}` - File contents
- `~/` - Expands to home directory
