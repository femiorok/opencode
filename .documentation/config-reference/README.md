# OpenCode Configuration Reference

Complete reference for all configuration options in `opencode.json` / `opencode.jsonc`.

## Sections

1. [File Format and Locations](./01-file-format-locations.md) - Config file types, locations, and merge behavior
2. [Core Options](./02-core-options.md) - Schema, theme, username, log level
3. [Models and Providers](./03-models-providers.md) - Model selection, provider configuration, API keys
4. [Agents](./04-agents.md) - Built-in and custom agents, agent configuration
5. [Commands](./05-commands.md) - Custom slash commands and templates
6. [MCP Servers](./06-mcp-servers.md) - Local and remote MCP server configuration
7. [Permissions](./07-permissions.md) - Tool permissions and security settings
8. [Tools](./08-tools.md) - Enabling and disabling tools
9. [TUI Settings](./09-tui-settings.md) - Terminal UI configuration
10. [Server Settings](./10-server-settings.md) - HTTP server and mDNS configuration
11. [Keybinds](./11-keybinds.md) - Keyboard shortcuts customization
12. [Formatters](./12-formatters.md) - Code formatter configuration
13. [LSP Servers](./13-lsp-servers.md) - Language Server Protocol configuration
14. [Sharing](./14-sharing.md) - Session sharing options
15. [Updates](./15-updates.md) - Auto-update behavior
16. [Instructions](./16-instructions.md) - Custom instruction files
17. [Plugins](./17-plugins.md) - Plugin loading and configuration
18. [File Watcher](./18-file-watcher.md) - File system watcher settings
19. [Compaction](./19-compaction.md) - Context compaction settings
20. [Experimental Features](./20-experimental.md) - Experimental options and hooks
21. [Variable Substitution](./21-variable-substitution.md) - Environment variables and file includes
22. [Directory Structure](./22-directory-structure.md) - Recommended project layout
23. [Complete Example](./23-complete-example.md) - Full configuration example

## Quick Start

Create `~/.config/opencode/opencode.jsonc` for global settings:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "theme": "opencode",
  "model": "anthropic/claude-sonnet-4-5"
}
```

Create `./opencode.json` in your project for project-specific settings:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "anthropic/claude-opus-4",
  "instructions": ["CONTRIBUTING.md"]
}
```

## Configuration Merging

Configurations are merged in priority order (later overrides earlier):
1. Global config (`~/.config/opencode/`)
2. Project config (`./opencode.json`)
3. Environment variables (`OPENCODE_CONFIG`, `OPENCODE_CONFIG_CONTENT`)

See [File Format and Locations](./01-file-format-locations.md) for details.
