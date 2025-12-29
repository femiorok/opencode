# Formatters

## `formatter`

**Type:** `false | Record<string, FormatterConfig>`

Code formatters automatically format files after the AI modifies them. Set to `false` to disable all formatting.

```json
{
  "formatter": {
    "prettier": {
      "disabled": true
    },
    "biome": {
      "command": ["npx", "biome", "format", "--write", "$FILE"],
      "extensions": [".js", ".ts", ".jsx", ".tsx", ".json"]
    },
    "black": {
      "command": ["black", "$FILE"],
      "extensions": [".py"]
    }
  }
}
```

---

## Options

### `disabled`

**Type:** `boolean`

Disable this specific formatter without removing its config.

```json
{
  "formatter": {
    "prettier": {
      "disabled": true
    }
  }
}
```

### `command`

**Type:** `string[]`

Command to run. Use `$FILE` as placeholder for the file path.

```json
{
  "formatter": {
    "rustfmt": {
      "command": ["rustfmt", "$FILE"],
      "extensions": [".rs"]
    }
  }
}
```

### `environment`

**Type:** `Record<string, string>`

Environment variables for the formatter process.

```json
{
  "formatter": {
    "prettier": {
      "command": ["npx", "prettier", "--write", "$FILE"],
      "environment": {
        "NODE_ENV": "development"
      },
      "extensions": [".js", ".ts"]
    }
  }
}
```

### `extensions`

**Type:** `string[]`

File extensions this formatter handles. Include the dot (`.js` not `js`).

```json
{
  "formatter": {
    "gofmt": {
      "command": ["gofmt", "-w", "$FILE"],
      "extensions": [".go"]
    }
  }
}
```

---

## How Formatting Works

1. AI modifies a file
2. OpenCode checks if any formatter matches the file extension
3. Matching formatters are run in order
4. If formatting fails, the original AI changes are kept

---

## Disable All Formatting

```json
{
  "formatter": false
}
```

---

## Common Formatter Configurations

### Prettier (JavaScript/TypeScript)

```json
{
  "formatter": {
    "prettier": {
      "command": ["npx", "prettier", "--write", "$FILE"],
      "extensions": [".js", ".jsx", ".ts", ".tsx", ".css", ".json", ".md"]
    }
  }
}
```

### Biome (JavaScript/TypeScript)

```json
{
  "formatter": {
    "biome": {
      "command": ["npx", "@biomejs/biome", "format", "--write", "$FILE"],
      "extensions": [".js", ".jsx", ".ts", ".tsx", ".json"]
    }
  }
}
```

### Black (Python)

```json
{
  "formatter": {
    "black": {
      "command": ["black", "$FILE"],
      "extensions": [".py"]
    }
  }
}
```

### Ruff (Python)

```json
{
  "formatter": {
    "ruff": {
      "command": ["ruff", "format", "$FILE"],
      "extensions": [".py"]
    }
  }
}
```

### rustfmt (Rust)

```json
{
  "formatter": {
    "rustfmt": {
      "command": ["rustfmt", "$FILE"],
      "extensions": [".rs"]
    }
  }
}
```

### gofmt (Go)

```json
{
  "formatter": {
    "gofmt": {
      "command": ["gofmt", "-w", "$FILE"],
      "extensions": [".go"]
    }
  }
}
```

### clang-format (C/C++)

```json
{
  "formatter": {
    "clang-format": {
      "command": ["clang-format", "-i", "$FILE"],
      "extensions": [".c", ".cpp", ".h", ".hpp"]
    }
  }
}
```

---

## Multiple Formatters for Same Extension

If multiple formatters match the same extension, they run in the order defined:

```json
{
  "formatter": {
    "eslint": {
      "command": ["npx", "eslint", "--fix", "$FILE"],
      "extensions": [".js", ".ts"]
    },
    "prettier": {
      "command": ["npx", "prettier", "--write", "$FILE"],
      "extensions": [".js", ".ts"]
    }
  }
}
```

This runs ESLint first (for linting fixes), then Prettier (for formatting).

---

## Troubleshooting

**Formatter not running:**
- Check that the extension matches (include the dot)
- Verify the command is correct and the tool is installed
- Check if `disabled: true` is set

**Formatting changes lost:**
- If the formatter fails, changes are reverted to the AI's original output
- Check OpenCode logs for formatter errors
- Test the command manually to ensure it works
