# Permissions

Permissions control what actions OpenCode can take without asking for confirmation. By default, OpenCode **allows all operations** to provide a frictionless experience. You can tighten this for security.

## `permission`

**Type:** `PermissionConfig`

```json
{
  "permission": {
    "edit": "ask",
    "bash": "ask",
    "skill": "allow",
    "webfetch": "ask",
    "doom_loop": "ask",
    "external_directory": "deny"
  }
}
```

---

## Permission Values

| Value | Behavior |
|-------|----------|
| `"allow"` | Action proceeds without confirmation |
| `"ask"` | User must approve each action |
| `"deny"` | Action is blocked entirely |

---

## Permission Types

### `edit`

Controls file creation and modification via the Write and Edit tools.

- `"allow"`: Files are created/modified immediately
- `"ask"`: Each file change requires approval
- `"deny"`: No file modifications allowed

### `bash`

Controls shell command execution. Can be a single value or pattern-based:

```jsonc
{
  "permission": {
    // Simple: same permission for all commands
    "bash": "ask",

    // Pattern-based: different permissions for different commands
    "bash": {
      "*": "ask",              // Default for unmatched commands
      "git *": "allow",        // All git commands allowed
      "npm test": "allow",     // Specific command allowed
      "rm *": "deny",          // Block rm commands
      "sudo *": "deny"         // Block sudo
    }
  }
}
```

Pattern matching uses glob-style patterns. More specific patterns take precedence.

### `skill`

Controls skill/command execution. Like bash, can be pattern-based:

```json
{
  "permission": {
    "skill": {
      "*": "allow",
      "deploy": "ask"
    }
  }
}
```

### `webfetch`

Controls web requests made by the AI.

- `"allow"`: AI can fetch any URL
- `"ask"`: Each URL fetch requires approval
- `"deny"`: No web access

### `doom_loop`

Controls behavior when the AI appears stuck in a loop (repeatedly trying the same failing action).

- `"allow"`: Continue trying
- `"ask"`: Ask user whether to continue
- `"deny"`: Stop immediately

### `external_directory`

Controls access to files outside the current project directory.

- `"allow"`: Can access any file on the system
- `"ask"`: Requires approval for external files
- `"deny"`: Restricted to project directory only

---

## Security Recommendations

### For Maximum Security

Use this configuration when working with sensitive code or untrusted projects:

```json
{
  "permission": {
    "edit": "ask",
    "bash": "ask",
    "webfetch": "ask",
    "external_directory": "deny"
  }
}
```

### For Trusted Projects

When you trust the project and want common operations pre-approved:

```json
{
  "permission": {
    "edit": "allow",
    "bash": {
      "*": "ask",
      "git *": "allow",
      "npm *": "allow",
      "pnpm *": "allow",
      "bun *": "allow",
      "cargo *": "allow",
      "go *": "allow",
      "python *": "allow",
      "pytest *": "allow"
    },
    "external_directory": "ask"
  }
}
```

### For Fully Automated Workflows

When running in CI/CD or automated environments:

```json
{
  "permission": {
    "edit": "allow",
    "bash": "allow",
    "webfetch": "allow",
    "external_directory": "allow"
  }
}
```

**Warning:** Only use this in controlled environments where you fully trust the input.

---

## Agent-Specific Permissions

You can also set permissions per-agent in the agent configuration:

```json
{
  "agent": {
    "reviewer": {
      "description": "Code review agent",
      "permission": {
        "edit": "deny",
        "bash": "deny"
      }
    }
  }
}
```

Agent-specific permissions override global permissions for that agent only.

---

## Pattern Matching Details

When using pattern-based permissions for `bash` or `skill`:

1. **Exact matches** take precedence over patterns
2. **More specific patterns** take precedence over less specific ones
3. **`*` wildcard** matches any characters
4. **Default `"*"`** is used when no pattern matches

**Example precedence:**
```json
{
  "bash": {
    "*": "ask",           // Lowest priority: catch-all
    "git *": "allow",     // Medium priority: git commands
    "git push": "ask"     // Highest priority: specific command
  }
}
```

With this config:
- `git status` → allowed (matches `git *`)
- `git push` → asks (matches specific `git push`)
- `rm -rf /` → asks (matches `*`)
