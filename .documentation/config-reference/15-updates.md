# Updates

## `autoupdate`

**Type:** `boolean | "notify"`
**Default:** `true`

Controls automatic update behavior.

```json
{
  "autoupdate": true
}
```

---

## Values

| Value | Behavior |
|-------|----------|
| `true` | Automatically download and install updates on startup |
| `false` | Never check for or install updates |
| `"notify"` | Check for updates and show notification, but don't install automatically |

---

## Automatic Updates

```json
{
  "autoupdate": true
}
```

With automatic updates enabled:
- OpenCode checks for updates on startup
- If a new version is available, it's downloaded
- The update is installed automatically
- You get the latest features and fixes without action

This is the default and recommended for most users.

---

## Notification Only

```json
{
  "autoupdate": "notify"
}
```

With notification mode:
- OpenCode checks for updates on startup
- If a new version is available, you're notified
- The update is NOT installed automatically
- You decide when to update manually

Useful when:
- You want to review changelogs before updating
- You're in the middle of important work
- You want control over when updates happen

---

## Disabled Updates

```json
{
  "autoupdate": false
}
```

With updates disabled:
- OpenCode never checks for updates
- No notifications about new versions
- You must manually update

Useful for:
- Corporate environments with controlled deployments
- Pinning to a specific version for stability
- Air-gapped systems without internet access

---

## Manual Update

Regardless of this setting, you can always update manually:

```bash
# Update to latest version
opencode update

# Or reinstall
curl -fsSL https://opencode.ai/install | bash
```
