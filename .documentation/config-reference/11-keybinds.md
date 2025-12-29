# Keybinds

## `keybinds`

**Type:** `KeybindsConfig`

Customize keyboard shortcuts. OpenCode uses a leader key system similar to Vim.

```json
{
  "keybinds": {
    "leader": "ctrl+x",
    "session_new": "<leader>n",
    "model_list": "<leader>m",
    "app_exit": "ctrl+c,ctrl+d"
  }
}
```

---

## Key Format

Keys are specified as lowercase strings with modifiers:

| Format | Meaning |
|--------|---------|
| `ctrl+x` | Control + X |
| `alt+f` | Alt + F |
| `shift+tab` | Shift + Tab |
| `super+z` | Command (Mac) / Windows key |
| `return` | Enter key |
| `escape` | Escape key |
| `<leader>n` | Leader key followed by N |

**Multiple bindings:** Separate with commas: `"ctrl+c,ctrl+d"`

**Disable a keybind:** Set to `"none"`

---

## Leader Key

**`leader`**
**Default:** `ctrl+x`

The prefix key for many commands. Press leader, release, then press the next key.

Example with default leader: `ctrl+x` then `n` creates a new session.

```json
{
  "keybinds": {
    "leader": "ctrl+space"
  }
}
```

---

## Application Keys

| Key | Default | Description |
|-----|---------|-------------|
| `app_exit` | `ctrl+c,ctrl+d,<leader>q` | Exit OpenCode |
| `editor_open` | `<leader>e` | Open current content in external editor |
| `theme_list` | `<leader>t` | Show theme picker |
| `sidebar_toggle` | `<leader>b` | Toggle sidebar visibility |
| `scrollbar_toggle` | `none` | Toggle session scrollbar |
| `username_toggle` | `none` | Toggle username display |
| `status_view` | `<leader>s` | Show status information |
| `terminal_suspend` | `ctrl+z` | Suspend to shell (fg to resume) |
| `terminal_title_toggle` | `none` | Toggle terminal title |
| `tips_toggle` | `<leader>h` | Toggle tips on home screen |

---

## Session Keys

| Key | Default | Description |
|-----|---------|-------------|
| `session_new` | `<leader>n` | Create new session |
| `session_list` | `<leader>l` | List all sessions |
| `session_timeline` | `<leader>g` | Show session timeline/history |
| `session_export` | `<leader>x` | Export session to external editor |
| `session_fork` | `none` | Fork session from current message |
| `session_rename` | `none` | Rename current session |
| `session_share` | `none` | Share session publicly |
| `session_unshare` | `none` | Remove public sharing |
| `session_interrupt` | `escape` | Stop current AI response |
| `session_compact` | `<leader>c` | Compact session (reduce context) |
| `session_child_cycle` | `<leader>right` | Next child session |
| `session_child_cycle_reverse` | `<leader>left` | Previous child session |
| `session_parent` | `<leader>up` | Go to parent session |

---

## Message Keys

| Key | Default | Description |
|-----|---------|-------------|
| `messages_page_up` | `pageup` | Scroll up one page |
| `messages_page_down` | `pagedown` | Scroll down one page |
| `messages_half_page_up` | `ctrl+alt+u` | Scroll up half page |
| `messages_half_page_down` | `ctrl+alt+d` | Scroll down half page |
| `messages_first` | `ctrl+g,home` | Jump to first message |
| `messages_last` | `ctrl+alt+g,end` | Jump to last message |
| `messages_next` | `none` | Next message |
| `messages_previous` | `none` | Previous message |
| `messages_last_user` | `none` | Jump to last user message |
| `messages_copy` | `<leader>y` | Copy message to clipboard |
| `messages_undo` | `<leader>u` | Undo last message |
| `messages_redo` | `<leader>r` | Redo undone message |
| `messages_toggle_conceal` | `<leader>h` | Toggle code block folding |
| `tool_details` | `none` | Toggle tool call details |

---

## Model Keys

| Key | Default | Description |
|-----|---------|-------------|
| `model_list` | `<leader>m` | Open model picker |
| `model_cycle_recent` | `f2` | Switch to next recent model |
| `model_cycle_recent_reverse` | `shift+f2` | Switch to previous recent model |
| `model_cycle_favorite` | `none` | Next favorite model |
| `model_cycle_favorite_reverse` | `none` | Previous favorite model |

---

## Agent Keys

| Key | Default | Description |
|-----|---------|-------------|
| `agent_list` | `<leader>a` | Open agent picker |
| `agent_cycle` | `tab` | Switch to next agent |
| `agent_cycle_reverse` | `shift+tab` | Switch to previous agent |

---

## Command Keys

| Key | Default | Description |
|-----|---------|-------------|
| `command_list` | `ctrl+p` | Open command picker |

---

## Input Editing Keys

| Key | Default | Description |
|-----|---------|-------------|
| `input_clear` | `ctrl+c` | Clear input field |
| `input_paste` | `ctrl+v` | Paste from clipboard |
| `input_submit` | `return` | Send message |
| `input_newline` | `shift+return,ctrl+return,alt+return,ctrl+j` | Insert newline |
| `input_undo` | `ctrl+-,super+z` | Undo in input |
| `input_redo` | `ctrl+.,super+shift+z` | Redo in input |
| `input_backspace` | `backspace,shift+backspace` | Delete character before cursor |
| `input_delete` | `ctrl+d,delete,shift+delete` | Delete character at cursor |
| `input_delete_line` | `ctrl+shift+d` | Delete entire line |
| `input_delete_to_line_end` | `ctrl+k` | Delete from cursor to end of line |
| `input_delete_to_line_start` | `ctrl+u` | Delete from cursor to start of line |
| `input_delete_word_forward` | `alt+d,alt+delete,ctrl+delete` | Delete word forward |
| `input_delete_word_backward` | `ctrl+w,ctrl+backspace,alt+backspace` | Delete word backward |

---

## Cursor Movement Keys

| Key | Default | Description |
|-----|---------|-------------|
| `input_move_left` | `left,ctrl+b` | Move cursor left |
| `input_move_right` | `right,ctrl+f` | Move cursor right |
| `input_move_up` | `up` | Move cursor up |
| `input_move_down` | `down` | Move cursor down |
| `input_line_home` | `ctrl+a` | Move to start of line |
| `input_line_end` | `ctrl+e` | Move to end of line |
| `input_visual_line_home` | `alt+a` | Move to start of visual (wrapped) line |
| `input_visual_line_end` | `alt+e` | Move to end of visual line |
| `input_buffer_home` | `home` | Move to start of input |
| `input_buffer_end` | `end` | Move to end of input |
| `input_word_forward` | `alt+f,alt+right,ctrl+right` | Move forward one word |
| `input_word_backward` | `alt+b,alt+left,ctrl+left` | Move backward one word |

---

## Selection Keys

| Key | Default | Description |
|-----|---------|-------------|
| `input_select_left` | `shift+left` | Extend selection left |
| `input_select_right` | `shift+right` | Extend selection right |
| `input_select_up` | `shift+up` | Extend selection up |
| `input_select_down` | `shift+down` | Extend selection down |
| `input_select_line_home` | `ctrl+shift+a` | Select to line start |
| `input_select_line_end` | `ctrl+shift+e` | Select to line end |
| `input_select_visual_line_home` | `alt+shift+a` | Select to visual line start |
| `input_select_visual_line_end` | `alt+shift+e` | Select to visual line end |
| `input_select_buffer_home` | `shift+home` | Select to input start |
| `input_select_buffer_end` | `shift+end` | Select to input end |
| `input_select_word_forward` | `alt+shift+f,alt+shift+right` | Select word forward |
| `input_select_word_backward` | `alt+shift+b,alt+shift+left` | Select word backward |

---

## History Keys

| Key | Default | Description |
|-----|---------|-------------|
| `history_previous` | `up` | Previous input history item |
| `history_next` | `down` | Next input history item |

---

## Example Configurations

### Vim-Style Leader

```json
{
  "keybinds": {
    "leader": "space"
  }
}
```

### Emacs-Style Bindings

```json
{
  "keybinds": {
    "leader": "ctrl+x",
    "input_line_home": "ctrl+a",
    "input_line_end": "ctrl+e",
    "input_delete_to_line_end": "ctrl+k"
  }
}
```

### Disable Potentially Conflicting Keys

```json
{
  "keybinds": {
    "terminal_suspend": "none",
    "input_clear": "none"
  }
}
```
