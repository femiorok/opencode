# Complete Example

A comprehensive configuration showing many options together.

```jsonc
{
  "$schema": "https://opencode.ai/config.json",

  //==========================================================================
  // APPEARANCE
  //==========================================================================
  "theme": "opencode",
  "username": "developer",

  //==========================================================================
  // MODELS
  //==========================================================================
  // Primary model for all coding tasks
  "model": "anthropic/claude-sonnet-4-5",
  // Cheaper model for background tasks (titles, summaries)
  "small_model": "anthropic/claude-haiku-4-5",
  // Start in build mode by default
  "default_agent": "build",

  //==========================================================================
  // PROVIDERS
  //==========================================================================
  "provider": {
    "anthropic": {
      // Only show these models in picker
      "whitelist": ["claude-sonnet-4-5", "claude-opus-4", "claude-haiku-4-5"],
      "options": {
        // API key from environment for security
        "apiKey": "{env:ANTHROPIC_API_KEY}",
        // 5 minute timeout for long operations
        "timeout": 300000
      }
    }
  },
  // Don't load these providers even if API keys exist
  "disabled_providers": ["gemini"],

  //==========================================================================
  // AGENTS
  //==========================================================================
  "agent": {
    // Customize built-in build agent
    "build": {
      "temperature": 0.5
    },
    // Custom security review agent
    "security": {
      "description": "Reviews code for security vulnerabilities",
      "mode": "subagent",
      "color": "#FF4444",
      "tools": {
        "write": false,
        "edit": false,
        "bash": false
      }
    }
  },

  //==========================================================================
  // PERMISSIONS
  //==========================================================================
  "permission": {
    // Allow file edits without confirmation
    "edit": "allow",
    // Pattern-based bash permissions
    "bash": {
      "*": "ask",           // Ask for unknown commands
      "git *": "allow",     // Allow all git commands
      "npm *": "allow",     // Allow all npm commands
      "pnpm *": "allow",
      "bun *": "allow",
      "rm -rf *": "deny"    // Block dangerous commands
    },
    // Ask before accessing files outside project
    "external_directory": "ask"
  },

  //==========================================================================
  // TUI
  //==========================================================================
  "tui": {
    "scroll_acceleration": {
      "enabled": true
    },
    "diff_style": "auto"
  },

  //==========================================================================
  // KEYBINDS
  //==========================================================================
  "keybinds": {
    "leader": "ctrl+x",
    "session_new": "<leader>n",
    "model_list": "<leader>m"
  },

  //==========================================================================
  // SERVER
  //==========================================================================
  "server": {
    "port": 4096,
    "mdns": true
  },

  //==========================================================================
  // FEATURES
  //==========================================================================
  // Manual sharing only
  "share": "manual",
  // Notify about updates but don't auto-install
  "autoupdate": "notify",
  // Include these files in AI context
  "instructions": [
    "CONTRIBUTING.md",
    "docs/architecture.md"
  ],

  //==========================================================================
  // COMPACTION
  //==========================================================================
  "compaction": {
    "auto": true,
    "prune": true
  },

  //==========================================================================
  // WATCHER
  //==========================================================================
  "watcher": {
    "ignore": [
      "**/node_modules/**",
      "**/dist/**",
      "**/.git/**"
    ]
  }
}
```

---

## Minimal Configuration

The simplest possible config:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5"
}
```

---

## Security-Focused Configuration

For sensitive projects:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5",
  "share": "disabled",
  "permission": {
    "edit": "ask",
    "bash": "ask",
    "webfetch": "deny",
    "external_directory": "deny"
  }
}
```

---

## Team/Enterprise Configuration

For shared team settings:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5",
  "enabled_providers": ["anthropic"],
  "share": "disabled",
  "autoupdate": false,
  "instructions": [
    "docs/coding-standards.md",
    "docs/security-guidelines.md"
  ],
  "permission": {
    "bash": {
      "*": "ask",
      "git *": "allow",
      "npm test": "allow",
      "npm run lint": "allow"
    }
  }
}
```

---

## Development Configuration

For active development with convenience:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-sonnet-4-5",
  "permission": {
    "edit": "allow",
    "bash": {
      "*": "allow"
    }
  },
  "tui": {
    "scroll_acceleration": {
      "enabled": true
    }
  },
  "experimental": {
    "hook": {
      "file_edited": {
        "*.ts": [{ "command": ["npx", "eslint", "--fix", "$FILE"] }],
        "*.tsx": [{ "command": ["npx", "eslint", "--fix", "$FILE"] }]
      }
    }
  }
}
```

---

## Deprecated Options

These options still work but should be migrated:

| Old | New |
|-----|-----|
| `"mode": {...}` | `"agent": {...}` with `mode: "primary"` |
| `"autoshare": true` | `"share": "auto"` |
| `"layout": "..."` | Removed (always stretch) |
