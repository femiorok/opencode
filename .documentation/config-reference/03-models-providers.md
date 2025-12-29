# Models and Providers

## `model`

**Type:** `string`
**Format:** `provider/model-id`

The primary AI model that OpenCode uses for all conversations and tasks. This is the most important configuration option—it determines the capabilities, speed, and cost of your coding assistant.

```json
{
  "model": "anthropic/claude-sonnet-4-5"
}
```

**Format explained:** The model string has two parts separated by `/`:
- **Provider**: The AI service (anthropic, openai, google, etc.)
- **Model ID**: The specific model from that provider

**Common model choices:**

| Model | Best For |
|-------|----------|
| `anthropic/claude-sonnet-4-5` | Best balance of capability and speed for most coding tasks |
| `anthropic/claude-opus-4` | Complex reasoning, architecture decisions, difficult bugs |
| `anthropic/claude-haiku-4-5` | Fast, simple tasks, cost-sensitive usage |
| `openai/gpt-4o` | Alternative if you prefer OpenAI |
| `google/gemini-2.0-flash` | Fast responses, good for iteration |

**How model selection works:**
1. If `model` is set, that model is used by default
2. Agents can override this with their own `model` setting
3. You can switch models mid-session using `<leader>m` or the model picker

---

## `small_model`

**Type:** `string`
**Format:** `provider/model-id`

A secondary, typically cheaper/faster model used for lightweight background tasks that don't need the full capability of your primary model.

```json
{
  "small_model": "anthropic/claude-haiku-4-5"
}
```

**Tasks that use the small model:**
- **Title generation**: Creating session titles from conversation content
- **Summary generation**: Summarizing long conversations
- **Other metadata tasks**: Tasks that need language understanding but not deep reasoning

**Why this matters:** These background tasks happen frequently. Using a cheaper model for them can significantly reduce costs without affecting your main coding experience. For example, Claude Haiku is ~10x cheaper than Claude Sonnet.

**Default behavior:** If not set, OpenCode tries to find a cheaper model from your configured provider. If none is available, it falls back to your main model.

---

## `default_agent`

**Type:** `string`
**Default:** `"build"`

Specifies which agent is active when you start OpenCode or create a new session. The agent determines the system prompt, available tools, and overall behavior.

```json
{
  "default_agent": "plan"
}
```

**Built-in primary agents:**
- `"build"` — The default coding agent. Can read, write, and execute code. Best for implementation tasks.
- `"plan"` — Planning mode. Focuses on understanding requirements and creating implementation plans before writing code.

**Requirements:**
- The specified agent must exist
- The agent must have `mode: "primary"` (not a subagent)
- If the agent doesn't exist or is a subagent, OpenCode falls back to `"build"` with a warning

**When to change this:**
- Set to `"plan"` if you prefer to start with planning before implementation
- Set to a custom agent if you've created one that better fits your workflow

---

## `provider`

**Type:** `Record<string, ProviderConfig>`

Configures AI providers with custom settings, API keys, model overrides, and filtering. This is where you fine-tune how OpenCode communicates with AI services.

```jsonc
{
  "provider": {
    "anthropic": {
      // Only show these models in the model picker
      "whitelist": ["claude-sonnet-4-5", "claude-opus-4"],

      // Never show these models
      "blacklist": ["claude-2", "claude-instant"],

      // Custom model configurations
      "models": {
        "claude-opus-thinking": {
          "id": "claude-opus-4-20250514",
          "name": "Claude Opus (Extended Thinking)",
          "options": {
            "thinking": {
              "type": "enabled",
              "budget_tokens": 32000
            }
          }
        }
      },

      // Provider-level options
      "options": {
        "apiKey": "{env:ANTHROPIC_API_KEY}",
        "baseURL": "https://api.anthropic.com",
        "timeout": 300000
      }
    }
  }
}
```

### Provider Options Explained

**`whitelist`** (`string[]`): When set, ONLY these models appear in the model picker for this provider. Useful for:
- Enterprise environments where only certain models are approved
- Simplifying the UI by hiding models you never use
- Cost control by hiding expensive models

**`blacklist`** (`string[]`): These models are hidden from the picker. Useful for:
- Hiding deprecated models you don't want to accidentally select
- Removing models that don't work well for your use case

**`models`** (`Record<string, ModelConfig>`): Define custom model configurations. Each key becomes a selectable model.

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | The actual API model ID to use. Required when your key differs from the real model name. |
| `name` | `string` | Display name in the UI. Defaults to the key if not set. |
| `options` | `object` | Model-specific options passed to the API (e.g., thinking mode, temperature defaults) |

**Example: Creating model variants:**
```json
{
  "provider": {
    "anthropic": {
      "models": {
        "sonnet-fast": {
          "id": "claude-sonnet-4-5-20250514",
          "name": "Sonnet (Fast)",
          "options": { "max_tokens": 4096 }
        },
        "sonnet-detailed": {
          "id": "claude-sonnet-4-5-20250514",
          "name": "Sonnet (Detailed)",
          "options": { "max_tokens": 16384 }
        }
      }
    }
  }
}
```

### Provider-Level Options

Settings that apply to all API calls for this provider:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | From env | API key. Usually set via environment variable for security. |
| `baseURL` | `string` | Provider default | Custom API endpoint. Useful for proxies, enterprise endpoints, or local models. |
| `enterpriseUrl` | `string` | — | GitHub Enterprise URL for Copilot authentication. |
| `setCacheKey` | `boolean` | `false` | Enable `promptCacheKey` for prompt caching (provider-specific). |
| `timeout` | `number \| false` | `300000` (5 min) | Request timeout in milliseconds. Set to `false` to disable timeout entirely (useful for very long-running requests). |

---

## `disabled_providers`

**Type:** `string[]`

Completely disable specific providers, even if their API keys are available. The provider won't load, and its models won't appear anywhere.

```json
{
  "disabled_providers": ["openai", "gemini"]
}
```

**Use cases:**
- Corporate policy restricts certain providers
- You have API keys set in your environment for other tools but don't want them in OpenCode
- Simplifying the model picker by removing providers you don't use

---

## `enabled_providers`

**Type:** `string[]`

When set, creates an allowlist—ONLY these providers are enabled. All others are completely ignored regardless of whether API keys are available.

```json
{
  "enabled_providers": ["anthropic"]
}
```

**Use cases:**
- Strict corporate environments where only specific providers are approved
- Personal preference to keep things simple with one provider
- Cost control by ensuring you only use specific providers

**Important:** `disabled_providers` takes priority over `enabled_providers`. If a provider appears in both, it will be disabled.
