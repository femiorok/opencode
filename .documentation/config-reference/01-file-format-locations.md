# File Format and Locations

## Supported Formats

OpenCode configuration files can be written in two formats:

**JSON** (`.json`): Standard JSON format. Must be valid JSON with no trailing commas or comments.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "theme": "opencode",
  "model": "anthropic/claude-sonnet-4-5"
}
```

**JSONC** (`.jsonc`): JSON with Comments. Allows single-line (`//`) and multi-line (`/* */`) comments, plus trailing commas. This is the recommended format for human-edited config files since you can document your choices inline.

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  // Using the dark theme for better contrast
  "theme": "opencode",
  "model": "anthropic/claude-sonnet-4-5", // trailing comma allowed
}
```

---

## Configuration File Locations

OpenCode loads configuration from multiple locations and **merges them together**. This means you can have a base global configuration and override specific settings per-project. Understanding this merge behavior is crucial:

- Settings from later files override earlier ones **only for conflicting keys**
- Non-conflicting settings from all configs are preserved
- Arrays (like `plugin`) are concatenated, not replaced

### Load Order (Later Overrides Earlier)

| Priority | Location | Purpose |
|----------|----------|---------|
| 1 | `~/.config/opencode/config.json` | Legacy global config (for backwards compatibility) |
| 2 | `~/.config/opencode/opencode.json` | Primary global config location |
| 3 | `~/.config/opencode/opencode.jsonc` | Global config with comments |
| 4 | `./opencode.json` | Project-specific config at repository root |
| 5 | `./opencode.jsonc` | Project-specific config with comments |
| 6 | `./.opencode/opencode.json` | Config inside project's `.opencode` directory |
| 7 | `~/.opencode/opencode.json` | Home directory fallback |
| 8 | `OPENCODE_CONFIG` env var | Path to custom config file |
| 9 | `OPENCODE_CONFIG_CONTENT` env var | Raw JSON string (used by SDK integrations) |
| 10 | `OPENCODE_CONFIG_DIR` env var | Additional directory to scan for config |

---

## Config Merging Example

**Global config** (`~/.config/opencode/opencode.json`):
```json
{
  "theme": "opencode",
  "autoupdate": true,
  "model": "anthropic/claude-sonnet-4-5",
  "permission": {
    "bash": "ask"
  }
}
```

**Project config** (`./opencode.json`):
```json
{
  "model": "openai/gpt-4o",
  "permission": {
    "edit": "allow"
  }
}
```

**Resulting merged config**:
```json
{
  "theme": "opencode",           // from global (not overridden)
  "autoupdate": true,            // from global (not overridden)
  "model": "openai/gpt-4o",      // from project (overrides global)
  "permission": {
    "bash": "ask",               // from global (merged)
    "edit": "allow"              // from project (merged)
  }
}
```

---

## Recommended Setup

For most users, we recommend:

1. **Global config** at `~/.config/opencode/opencode.jsonc` for:
   - Theme preferences
   - Provider API keys
   - Default keybinds
   - Personal preferences that apply everywhere

2. **Project config** at `./opencode.json` (safe to commit to git) for:
   - Project-specific model selection
   - Custom agents for your project
   - Project-specific instructions

3. **Project `.opencode/` directory** for:
   - Custom agents (`.opencode/agent/*.md`)
   - Custom commands (`.opencode/command/*.md`)
   - Project-specific plugins (`.opencode/plugin/*.ts`)

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `OPENCODE_CONFIG` | Path to a custom config file |
| `OPENCODE_CONFIG_CONTENT` | Raw JSON config string (used by SDK) |
| `OPENCODE_CONFIG_DIR` | Additional directory to scan for agents, commands, plugins |
