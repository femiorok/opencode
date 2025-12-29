# Compaction

## `compaction`

**Type:** `CompactionConfig`

Compaction reduces conversation context when it gets too long, allowing conversations to continue indefinitely.

```json
{
  "compaction": {
    "auto": true,
    "prune": true
  }
}
```

---

## Options

### `auto`

**Type:** `boolean`
**Default:** `true`

Enable automatic compaction when context window is nearly full.

```json
{
  "compaction": {
    "auto": true
  }
}
```

- `true`: Automatically compact when context is nearly full
- `false`: Never auto-compact; manual only via `<leader>c`

### `prune`

**Type:** `boolean`
**Default:** `true`

Remove detailed tool outputs during compaction.

```json
{
  "compaction": {
    "prune": true
  }
}
```

- `true`: Remove detailed tool outputs, keep only summaries (saves context)
- `false`: Keep all tool output details (uses more context)

---

## How Compaction Works

1. **Context fills up**: As you chat, the conversation grows
2. **Threshold reached**: When context is ~80% full, compaction triggers
3. **Summary generated**: A summary of old messages is created
4. **Messages replaced**: Old messages are replaced with the summary
5. **Recent kept**: Recent messages are kept in full detail
6. **Conversation continues**: You can keep chatting with the summary as context

---

## What Gets Compacted

**Compacted (summarized):**
- Older messages in the conversation
- Detailed tool outputs (if `prune: true`)
- File contents that were read earlier

**Kept in full:**
- Recent messages (last few exchanges)
- Current working context
- Active tool results

---

## Manual Compaction

You can manually trigger compaction anytime:
- Press `<leader>c` (default: `ctrl+x c`)
- Useful before a complex task to free up context
- Works even if `auto` is disabled

---

## Environment Variable Overrides

Override compaction settings via environment variables:

```bash
# Disable auto-compaction
export OPENCODE_DISABLE_AUTOCOMPACT=1

# Disable pruning
export OPENCODE_DISABLE_PRUNE=1
```

Useful for:
- Debugging long conversations
- Troubleshooting compaction issues
- Temporary overrides without config changes

---

## When to Disable Auto-Compaction

Consider `"auto": false` when:
- Debugging compaction behavior
- You want full control over when context is reduced
- Working with very long contexts that need preservation

---

## When to Disable Pruning

Consider `"prune": false` when:
- Tool outputs contain important details needed later
- Debugging issues where tool results matter
- You have a model with very large context window

---

## Practical Configurations

### Default (Recommended)

```json
{
  "compaction": {
    "auto": true,
    "prune": true
  }
}
```

### Maximum Context Preservation

```json
{
  "compaction": {
    "auto": false,
    "prune": false
  }
}
```

Manual compaction only, keep all details.

### Auto-Compact but Keep Details

```json
{
  "compaction": {
    "auto": true,
    "prune": false
  }
}
```

Automatic compaction but preserves tool output details.
