# TUI Settings

## `tui`

**Type:** `TuiConfig`

Configuration for the terminal user interface.

```json
{
  "tui": {
    "scroll_speed": 3,
    "scroll_acceleration": {
      "enabled": true
    },
    "diff_style": "auto"
  }
}
```

---

## Options

### `scroll_speed`

**Type:** `number`
**Minimum:** `0.001`
**Default:** `1`

Multiplier for scroll speed. Higher values mean faster scrolling.

```json
{
  "tui": {
    "scroll_speed": 2.5
  }
}
```

- `1.0`: Default scroll speed
- `2.0-3.0`: Noticeably faster, good for large codebases
- `0.5`: Slower, more precise scrolling

**Note:** This setting is ignored if `scroll_acceleration.enabled` is `true`.

---

### `scroll_acceleration`

**Type:** `{ enabled: boolean }`

Enables macOS-style scroll acceleration.

```json
{
  "tui": {
    "scroll_acceleration": {
      "enabled": true
    }
  }
}
```

**How it works:**
- Scrolling starts slow for precise positioning
- Speed increases as you continue scrolling
- Provides fine control for small movements and fast travel for long distances

**When to enable:**
- If you're used to macOS scrolling behavior
- When working with very long files or conversations
- If you want both precision and speed

**When to disable:**
- If you prefer consistent scroll speed
- If acceleration feels disorienting
- When using a mouse with its own acceleration

**Takes precedence over `scroll_speed`** when enabled.

---

### `diff_style`

**Type:** `"auto" | "stacked"`
**Default:** `"auto"`

Controls how file diffs (code changes) are displayed.

```json
{
  "tui": {
    "diff_style": "stacked"
  }
}
```

**`"auto"`**: Adapts to terminal width
- Wide terminals: Side-by-side diff (old on left, new on right)
- Narrow terminals: Stacked diff (old on top, new below)

**`"stacked"`**: Always single-column
- Old version shown first
- New version shown below
- Useful if you prefer vertical scanning
- Better for very long lines that would wrap in side-by-side view

---

## Complete Example

```json
{
  "tui": {
    "scroll_speed": 2,
    "scroll_acceleration": {
      "enabled": true
    },
    "diff_style": "auto"
  }
}
```

This configuration:
- Enables scroll acceleration (scroll_speed is ignored)
- Uses adaptive diff display based on terminal width
