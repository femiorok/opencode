# Core Options

## `$schema`

**Type:** `string`
**Default:** `"https://opencode.ai/config.json"`

The JSON Schema URL that enables IDE features like autocomplete, validation, and inline documentation. Your editor (VS Code, Neovim with LSP, etc.) will use this schema to:

- Show autocomplete suggestions for config keys
- Validate that values are the correct type
- Display hover documentation for each field
- Warn about unknown or deprecated fields

You typically don't need to set this manually—OpenCode will add it automatically when it writes to your config file. However, if you're creating a new config file from scratch, add it first to get editor support while you write the rest.

```json
{
  "$schema": "https://opencode.ai/config.json"
}
```

---

## `theme`

**Type:** `string`
**Default:** Uses terminal default colors

Sets the visual theme for OpenCode's terminal UI. Themes control colors for syntax highlighting, UI elements, messages, and more.

OpenCode ships with several built-in themes. You can list available themes with `<leader>t` (default: `ctrl+x t`) in the TUI, or by running `opencode theme list`.

```json
{
  "theme": "opencode"
}
```

**Where themes come from:**
- Built-in themes ship with OpenCode
- Custom themes can be placed in `~/.config/opencode/themes/`
- Themes are JSON files defining color palettes

**When to use:** Set this in your global config to have consistent colors across all projects.

---

## `username`

**Type:** `string`
**Default:** Your system username (from `os.userInfo().username`)

The display name shown in conversation messages. This is purely cosmetic and appears next to your messages in the chat interface.

```json
{
  "username": "Alice"
}
```

**When to change this:**
- If your system username is something generic like "user" or "admin"
- If you want a more personal touch in the UI
- If you're sharing sessions and want a recognizable name

---

## `logLevel`

**Type:** `"debug" | "info" | "warn" | "error"`
**Default:** `"info"`

Controls the verbosity of OpenCode's internal logging. Logs are written to `~/.local/state/opencode/logs/` (or equivalent on your platform).

| Level | What's Logged |
|-------|---------------|
| `debug` | Everything, including internal state changes, API call details, timing info |
| `info` | Normal operations, config loading, session events |
| `warn` | Potential issues that don't stop execution |
| `error` | Failures and exceptions |

```json
{
  "logLevel": "debug"
}
```

**When to change this:**
- Set to `"debug"` when troubleshooting issues or reporting bugs
- Set to `"error"` on resource-constrained systems to reduce disk I/O
- Keep at `"info"` for normal use
