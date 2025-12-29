# Directory Structure

Recommended project structure for OpenCode configuration.

---

## Overview

```
~/.config/opencode/              # Global configuration
├── opencode.jsonc               # Main config file
├── agent/                       # Global custom agents
│   ├── reviewer.md
│   └── architect.md
├── command/                     # Global custom commands
│   ├── deploy.md
│   └── test.md
├── plugin/                      # Global plugins
│   └── my-plugin.ts
└── themes/                      # Custom themes
    └── my-theme.json

your-project/
├── opencode.json                # Project config (commit to git)
└── .opencode/                   # Project-specific customization
    ├── opencode.json            # Additional project config
    ├── agent/                   # Project-specific agents
    │   └── project-expert.md
    ├── command/                 # Project-specific commands
    │   └── build.md
    └── plugin/                  # Project-specific plugins
        └── project-tools.ts
```

---

## Important: Singular Directory Names

Use **singular** directory names:
- `agent/` (not `agents/`)
- `command/` (not `commands/`)
- `plugin/` (not `plugins/`)

OpenCode will warn if you accidentally use plural names.

---

## Global Configuration

Location: `~/.config/opencode/`

For settings that apply across all projects:

### `opencode.jsonc`

Main global config file.

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "theme": "opencode",
  "model": "anthropic/claude-sonnet-4-5",
  "keybinds": {
    "leader": "ctrl+x"
  }
}
```

### `agent/`

Global agents available in all projects.

```
~/.config/opencode/agent/
├── reviewer.md      # Code review agent
├── architect.md     # Architecture planning agent
└── debugger.md      # Debugging specialist
```

### `command/`

Global commands available in all projects.

```
~/.config/opencode/command/
├── commit.md        # Git commit helper
├── review.md        # Code review command
└── test.md          # Test runner command
```

### `plugin/`

Global plugins loaded for all projects.

```
~/.config/opencode/plugin/
├── analytics.ts     # Usage tracking
└── notifications.ts # Desktop notifications
```

### `themes/`

Custom color themes.

```
~/.config/opencode/themes/
├── dark-blue.json
└── light-minimal.json
```

---

## Project Configuration

Location: Project root and `.opencode/` directory

For project-specific settings:

### `opencode.json` (Project Root)

Project config safe to commit to git.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-opus-4",
  "instructions": ["CONTRIBUTING.md"]
}
```

### `.opencode/` Directory

Project-specific agents, commands, and plugins.

```
.opencode/
├── opencode.json    # Additional project config
├── agent/
│   └── project-expert.md
├── command/
│   └── build.md
└── plugin/
    └── custom-tool.ts
```

---

## What Goes Where

| Item | Global | Project |
|------|--------|---------|
| Theme preferences | ✓ | |
| API keys | ✓ | |
| Default keybinds | ✓ | |
| Personal preferences | ✓ | |
| Project model | | ✓ |
| Project instructions | | ✓ |
| Project agents | | ✓ |
| Project commands | | ✓ |
| Team conventions | | ✓ |

---

## Git Considerations

**Safe to commit:**
- `opencode.json` in project root
- `.opencode/agent/`
- `.opencode/command/`
- `.opencode/opencode.json` (if no secrets)

**Don't commit:**
- API keys or tokens
- Personal preferences
- Files containing `{file:...}` references to secrets

**Example `.gitignore`:**
```gitignore
# Don't commit local plugin builds
.opencode/plugin/node_modules/
.opencode/plugin/*.js
.opencode/plugin/*.d.ts

# Don't commit if you put secrets here
.opencode/secrets/
```

---

## Alternative Global Locations

OpenCode also checks these locations:

| Path | Priority |
|------|----------|
| `~/.config/opencode/` | Primary (recommended) |
| `~/.opencode/` | Fallback |

Both work, but `~/.config/opencode/` follows XDG conventions and is preferred.
