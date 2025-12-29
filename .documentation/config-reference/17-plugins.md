# Plugins

## `plugin`

**Type:** `string[]`

Plugins extend OpenCode with custom tools, hooks, and integrations.

```json
{
  "plugin": [
    "opencode-helicone-session",
    "@my-org/custom-plugin",
    "./local-plugin.ts"
  ]
}
```

---

## Plugin Sources

### npm Packages

```json
{
  "plugin": [
    "opencode-helicone-session",
    "@my-org/custom-plugin"
  ]
}
```

Packages are installed automatically when OpenCode starts.

### Local Files

```json
{
  "plugin": [
    "./plugins/my-plugin.ts",
    "../shared/plugin.ts"
  ]
}
```

Paths are relative to the config file location.

### URLs

```json
{
  "plugin": [
    "https://example.com/plugin.ts"
  ]
}
```

---

## Auto-Discovered Plugins

Plugins in these directories are loaded automatically without configuration:

**Global plugins:**
```
~/.config/opencode/plugin/
├── analytics.ts
└── custom-tool.ts
```

**Project plugins:**
```
.opencode/plugin/
├── project-tool.ts
└── lint-hook.ts
```

**Supported extensions:** `.ts`, `.js`

---

## Plugin Capabilities

Plugins can:
- Add custom tools for the AI to use
- Register hooks that run on events
- Provide custom commands
- Integrate with external services
- Modify AI behavior

---

## Example Plugin Structure

```typescript
// .opencode/plugin/my-plugin.ts
import { definePlugin } from "@opencode-ai/plugin"

export default definePlugin({
  name: "my-plugin",

  tools: [
    {
      name: "my-tool",
      description: "Does something useful",
      parameters: {
        type: "object",
        properties: {
          input: { type: "string" }
        }
      },
      execute: async ({ input }) => {
        return `Processed: ${input}`
      }
    }
  ],

  hooks: {
    "session.start": async (session) => {
      console.log("Session started:", session.id)
    }
  }
})
```

---

## Common Plugins

### Helicone Analytics

```json
{
  "plugin": ["opencode-helicone-session"]
}
```

Tracks API usage and costs with Helicone.

### Custom Integrations

Many teams create internal plugins for:
- Jira/Linear ticket creation
- Slack notifications
- Custom deployment tools
- Database access
- Internal API integrations

---

## Plugin Loading Order

1. Global plugins (`~/.config/opencode/plugin/`)
2. Project plugins (`.opencode/plugin/`)
3. Plugins specified in `plugin` array

Later plugins can override earlier ones if they have the same name.

---

## Troubleshooting

**Plugin not loading:**
- Check the file path is correct
- Verify the file exports a valid plugin
- Look at OpenCode logs for errors

**npm plugin not installing:**
- Check your internet connection
- Verify the package name is correct
- Try installing manually with npm/pnpm

**Plugin errors:**
- Check the plugin code for syntax errors
- Verify all dependencies are available
- Look at stack traces in logs
