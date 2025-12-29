# Variable Substitution

Config files support variable substitution for dynamic values.

---

## Environment Variables

Use `{env:VARIABLE_NAME}` to insert environment variable values:

```json
{
  "model": "{env:OPENCODE_MODEL}",
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "{env:ANTHROPIC_API_KEY}"
      }
    }
  }
}
```

### Behavior

- If the variable exists, its value is inserted
- If the variable doesn't exist, an empty string is inserted
- Variables are resolved when the config is loaded

### Security Benefits

Using `{env:...}` for API keys is safer than hardcoding them:
- Config file can be committed to git without exposing secrets
- Different environments can use different values
- Keys can be rotated without config changes

### Common Environment Variables

```json
{
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "{env:ANTHROPIC_API_KEY}"
      }
    },
    "openai": {
      "options": {
        "apiKey": "{env:OPENAI_API_KEY}"
      }
    },
    "google": {
      "options": {
        "apiKey": "{env:GOOGLE_API_KEY}"
      }
    }
  }
}
```

---

## File Contents

Use `{file:path}` to insert the contents of a file:

```json
{
  "provider": {
    "openai": {
      "options": {
        "apiKey": "{file:~/.secrets/openai-key}"
      }
    }
  }
}
```

### Path Formats

**Relative to config file:**
```json
{
  "apiKey": "{file:./secrets/key.txt}"
}
```

**Absolute path:**
```json
{
  "apiKey": "{file:/etc/opencode/key}"
}
```

**Home directory:**
```json
{
  "apiKey": "{file:~/.secrets/key}"
}
```

### Use Cases

**Keeping secrets in separate files:**
```json
{
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "{file:~/.config/opencode/secrets/anthropic.key}"
      }
    }
  }
}
```

This lets you:
- Set restrictive permissions on the key file
- Keep the key out of version control
- Share config structure without sharing secrets

**Including large prompts:**
```json
{
  "agent": {
    "custom": {
      "prompt": "{file:./prompts/custom-agent.md}"
    }
  }
}
```

**Sharing common snippets:**
```json
{
  "instructions": [
    "{file:~/.config/opencode/shared/coding-standards.md}"
  ]
}
```

### Error Handling

If the file doesn't exist, OpenCode throws an error:
```
ConfigInvalidError: bad file reference: "{file:~/.secrets/missing-key}" ~/.secrets/missing-key does not exist
```

This is intentional—missing secrets should fail loudly rather than silently.

---

## Combining Variables

You can use multiple variables in the same config:

```json
{
  "model": "{env:OPENCODE_MODEL}",
  "provider": {
    "anthropic": {
      "options": {
        "apiKey": "{file:~/.secrets/anthropic.key}",
        "baseURL": "{env:ANTHROPIC_BASE_URL}"
      }
    }
  },
  "mcp": {
    "github": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-github"],
      "environment": {
        "GITHUB_TOKEN": "{env:GITHUB_TOKEN}"
      }
    }
  }
}
```

---

## Best Practices

### For API Keys

Prefer environment variables or file references:
```json
{
  "apiKey": "{env:API_KEY}"
}
```

**Never hardcode:**
```json
{
  "apiKey": "sk-1234567890abcdef"
}
```

### For Secrets Files

Set restrictive permissions:
```bash
chmod 600 ~/.secrets/opencode/*
```

Keep them out of git:
```bash
echo "*.key" >> ~/.secrets/.gitignore
```

### For Shared Configs

Use environment variables for values that differ:
```json
{
  "model": "{env:OPENCODE_MODEL}",
  "small_model": "{env:OPENCODE_SMALL_MODEL}"
}
```

Then set per-environment:
```bash
# Development
export OPENCODE_MODEL="anthropic/claude-haiku-4-5"

# Production
export OPENCODE_MODEL="anthropic/claude-sonnet-4-5"
```
