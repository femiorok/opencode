# File Watcher

## `watcher`

**Type:** `WatcherConfig`

Controls which files OpenCode watches for changes. The watcher notifies you of external file changes during a session.

```json
{
  "watcher": {
    "ignore": [
      "**/node_modules/**",
      "**/.git/**",
      "**/dist/**",
      "**/build/**",
      "**/*.log"
    ]
  }
}
```

---

## Options

### `ignore`

**Type:** `string[]`

Glob patterns for files and directories to ignore.

```json
{
  "watcher": {
    "ignore": [
      "**/node_modules/**",
      "**/.git/**",
      "**/dist/**"
    ]
  }
}
```

---

## Default Ignored Patterns

These patterns are always ignored regardless of configuration:
- `node_modules`
- `.git`
- Various build output directories

---

## How the Watcher Works

1. OpenCode watches your project directory for file changes
2. When a file changes externally (outside OpenCode), you're notified
3. This helps you stay aware of changes from other tools, editors, or teammates
4. Ignored files don't trigger notifications

---

## When to Customize

**Add patterns for:**
- Large generated directories that slow down watching
- Temporary files from your build process
- Log files that change frequently
- Cache directories
- Dependency directories not in node_modules

**Example for a complex project:**
```json
{
  "watcher": {
    "ignore": [
      "**/node_modules/**",
      "**/.git/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/coverage/**",
      "**/*.log",
      "**/tmp/**",
      "**/.cache/**"
    ]
  }
}
```

---

## Performance Considerations

Watching too many files can impact performance. Consider ignoring:

- **Build outputs:** `dist/`, `build/`, `.next/`, `out/`
- **Dependencies:** `node_modules/`, `vendor/`, `.pnpm/`
- **Caches:** `.cache/`, `.turbo/`, `.parcel-cache/`
- **Generated files:** `*.generated.ts`, `*.d.ts`
- **Large data files:** `*.csv`, `*.json` (if large)

---

## Glob Pattern Syntax

| Pattern | Matches |
|---------|---------|
| `*` | Any characters in a single path segment |
| `**` | Any characters across path segments |
| `?` | Single character |
| `[abc]` | One of the characters |
| `[!abc]` | Not one of the characters |

**Examples:**
- `**/*.log` — All .log files anywhere
- `**/test/**` — All files in any test directory
- `dist/**` — Everything in dist directory
- `*.tmp` — All .tmp files in root
