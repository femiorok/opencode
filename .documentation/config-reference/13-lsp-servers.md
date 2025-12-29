# LSP Servers

## `lsp`

**Type:** `false | Record<string, LspConfig>`

Language Server Protocol servers provide diagnostics (errors, warnings) that OpenCode uses to catch and fix issues. Set to `false` to disable all LSP.

```json
{
  "lsp": {
    "typescript": {
      "disabled": true
    },
    "rust-analyzer": {
      "command": ["rust-analyzer"],
      "extensions": [".rs"],
      "initialization": {
        "cargo": {
          "buildScripts": { "enable": true }
        }
      }
    },
    "custom-lsp": {
      "command": ["my-custom-lsp", "--stdio"],
      "extensions": [".custom"],
      "env": {
        "DEBUG": "1"
      }
    }
  }
}
```

---

## Options

### `disabled`

**Type:** `boolean` or `{ disabled: true }`

Disable this LSP server.

```json
{
  "lsp": {
    "pyright": {
      "disabled": true
    }
  }
}
```

### `command`

**Type:** `string[]`

Command to start the LSP server. Most LSP servers use `--stdio` for communication.

```json
{
  "lsp": {
    "gopls": {
      "command": ["gopls"],
      "extensions": [".go"]
    }
  }
}
```

### `extensions`

**Type:** `string[]`

File extensions this LSP handles. **Required for custom LSP servers** (built-in servers have default extensions).

```json
{
  "lsp": {
    "custom": {
      "command": ["my-lsp"],
      "extensions": [".xyz", ".abc"]
    }
  }
}
```

### `env`

**Type:** `Record<string, string>`

Environment variables for the LSP process.

```json
{
  "lsp": {
    "rust-analyzer": {
      "command": ["rust-analyzer"],
      "extensions": [".rs"],
      "env": {
        "RUST_LOG": "info"
      }
    }
  }
}
```

### `initialization`

**Type:** `Record<string, any>`

LSP initialization options. These are server-specific settings passed during the initialize handshake.

```json
{
  "lsp": {
    "typescript": {
      "initialization": {
        "preferences": {
          "includeInlayParameterNameHints": "all"
        }
      }
    }
  }
}
```

---

## Built-in LSP Servers

OpenCode includes pre-configured support for common languages. You only need to configure LSP if you want to:
- Disable a built-in server
- Add a custom server
- Override initialization options

Built-in servers are automatically detected and started when you open files of the corresponding type.

---

## Disable All LSP

```json
{
  "lsp": false
}
```

---

## Common LSP Configurations

### TypeScript

```json
{
  "lsp": {
    "typescript": {
      "command": ["typescript-language-server", "--stdio"],
      "extensions": [".ts", ".tsx", ".js", ".jsx"],
      "initialization": {
        "preferences": {
          "importModuleSpecifierPreference": "relative"
        }
      }
    }
  }
}
```

### Python (Pyright)

```json
{
  "lsp": {
    "pyright": {
      "command": ["pyright-langserver", "--stdio"],
      "extensions": [".py"],
      "initialization": {
        "python": {
          "analysis": {
            "typeCheckingMode": "basic"
          }
        }
      }
    }
  }
}
```

### Rust

```json
{
  "lsp": {
    "rust-analyzer": {
      "command": ["rust-analyzer"],
      "extensions": [".rs"],
      "initialization": {
        "cargo": {
          "buildScripts": { "enable": true },
          "features": "all"
        },
        "checkOnSave": {
          "command": "clippy"
        }
      }
    }
  }
}
```

### Go

```json
{
  "lsp": {
    "gopls": {
      "command": ["gopls"],
      "extensions": [".go"],
      "initialization": {
        "staticcheck": true,
        "gofumpt": true
      }
    }
  }
}
```

### C/C++ (clangd)

```json
{
  "lsp": {
    "clangd": {
      "command": ["clangd", "--background-index"],
      "extensions": [".c", ".cpp", ".h", ".hpp"]
    }
  }
}
```

---

## How LSP Integration Works

1. When you open or edit a file, OpenCode starts the matching LSP server
2. The LSP server analyzes the code and reports diagnostics
3. Diagnostics (errors, warnings) are shown to the AI
4. The AI can use diagnostics to fix issues proactively

---

## Troubleshooting

**LSP not starting:**
- Verify the command is correct and the tool is installed
- Check that extensions are correct (include the dot)
- Look at OpenCode logs for startup errors

**No diagnostics appearing:**
- Ensure the LSP server supports the file type
- Check initialization options for any required settings
- Some servers need project configuration (tsconfig.json, etc.)

**Wrong diagnostics:**
- Check initialization options
- Verify project configuration files are correct
- Try running the LSP server manually to test
