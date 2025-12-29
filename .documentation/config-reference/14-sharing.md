# Sharing

## `share`

**Type:** `"manual" | "auto" | "disabled"`
**Default:** `"manual"`

Controls whether and how sessions can be shared publicly.

```json
{
  "share": "manual"
}
```

---

## Values

| Value | Behavior |
|-------|----------|
| `"manual"` | Sessions can be shared using the `/share` command |
| `"auto"` | New sessions are automatically shared |
| `"disabled"` | Sharing is completely disabled |

---

## Manual Sharing

```json
{
  "share": "manual"
}
```

With manual sharing:
- Sessions are private by default
- Use `/share` command to share a specific session
- A public URL is generated that anyone can access
- Use `/unshare` to remove public access

This is the default and recommended for most users.

---

## Automatic Sharing

```json
{
  "share": "auto"
}
```

With automatic sharing:
- Every new session is automatically shared
- Public URL is available immediately
- Useful for teams who want to share all work
- Still can unshare individual sessions

---

## Disabled Sharing

```json
{
  "share": "disabled"
}
```

With sharing disabled:
- No sessions can be shared
- `/share` command is not available
- Useful for sensitive projects or corporate environments

---

## Privacy Considerations

**What's included in shared sessions:**
- All messages in the conversation
- AI responses including code
- File changes and diffs
- Tool call details

**What's NOT included:**
- Your API keys or credentials
- Files outside the conversation
- Other sessions

**Recommendations:**
- Use `"manual"` for personal projects
- Use `"disabled"` for sensitive or proprietary code
- Review session content before sharing

---

## `autoshare` (Deprecated)

**Type:** `boolean`

This field is deprecated. Use `share` instead.

| Old | New |
|-----|-----|
| `"autoshare": true` | `"share": "auto"` |
| `"autoshare": false` | `"share": "manual"` |
