# Desktop/Web App vs TUI Differences

## What are the different OpenCode interfaces?

| Interface | Description | Platform |
|-----------|-------------|----------|
| **TUI** | Terminal User Interface | All (terminal) |
| **Desktop App** | Electron-based desktop app | macOS, Windows, Linux |
| **Web App** | Browser-based interface | All (browser) |
| **SDK** | Programmatic JavaScript/TypeScript API | Node.js |
| **VSCode Extension** | IDE integration | VSCode |
| **Zed ACP** | Zed editor integration | Zed |

All interfaces connect to the same OpenCode server backend.

---

## What features work only in TUI?

| Feature | TUI | Desktop/Web |
|---------|-----|-------------|
| Keyboard shortcuts | Full support | Partial |
| Custom keybinds | Yes | Limited |
| vim mode | Yes | No |
| Terminal themes | Yes | Separate theme system |
| PTY management | Native | Integrated terminal |
| Low latency | Best | Good |
| Resource usage | Minimal | Higher (Electron/browser) |

---

## What features work only in Desktop/Web?

| Feature | TUI | Desktop/Web |
|---------|-----|-------------|
| Rich markdown rendering | Basic | Full |
| Image display | No | Yes |
| Side-by-side diff view | No | Yes |
| Mouse interaction | Limited | Full |
| Multi-window | No | Yes |
| Custom themes (JSON) | No | Yes |

---

## Why don't subagent sessions appear in the Desktop sidebar?

**By design.** Sessions with a `parentID` are filtered from the sidebar to reduce clutter:

```typescript
.filter((x) => x.parentID === undefined)
```

This affects both Desktop and TUI. See the [Subagents FAQ](./subagents.md) for details.

**Historical note:** Earlier versions displayed a hierarchical view with indentation for child sessions. This was simplified but may return as a feature request ([#6183](https://github.com/sst/opencode/issues/6183)).

---

## Desktop app stability issues

### AppImage on Linux

AppImages may fail on immutable Linux distributions (NixOS, Bazzite, Fedora Silverblue) due to FUSE restrictions.

**Error:** `fusermount3: mount failed: Operation not permitted`

**Workarounds:**
1. Extract the AppImage manually: `./opencode.AppImage --appimage-extract`
2. Run the extracted binary directly
3. Use the TUI instead: `opencode` in terminal

### Wayland issues

Some Wayland compositors cause WebKit errors in the Desktop app.

**Error:** `WebKit encountered an internal error`

**Workarounds:**
1. Set `GDK_BACKEND=x11` environment variable
2. Run under Xwayland
3. Use the TUI or Web app instead

### Windows issues

Windows users may encounter:
- Path resolution issues with spaces
- PowerShell vs CMD differences
- Missing dependencies

**Workaround:** Run from Git Bash or WSL.

---

## Why does behavior differ between platforms?

### Configuration

All platforms share the same configuration, but:
- Desktop/Web may have additional theme settings
- TUI has specific keybind options
- Some experimental features may be platform-specific

### Terminal handling

- **TUI**: Direct PTY access, full ANSI support
- **Desktop/Web**: Embedded terminal emulator with some limitations

### File system access

- **TUI**: Direct filesystem access
- **Desktop**: May have sandbox restrictions
- **Web**: Requires server-side file access

---

## Which interface should I use?

| Use Case | Recommended Interface |
|----------|----------------------|
| Daily coding | TUI (fastest, most keyboard-friendly) |
| Visual review of changes | Desktop/Web |
| Viewing images/rich content | Desktop/Web |
| CI/CD integration | SDK |
| IDE integration | VSCode Extension or Zed ACP |
| Remote server | TUI (SSH) |
| Resource-constrained system | TUI |

---

## How do I switch between interfaces?

All interfaces connect to the same server and share sessions.

### Using the same server

1. Start TUI: `opencode`
2. Note the server URL from output
3. Point Desktop/Web to that server

### Using SDK to control interfaces

```typescript
import { createOpencodeClient } from "@opencode-ai/sdk"

const client = createOpencodeClient({
  baseUrl: "http://localhost:4096"
})

// Control TUI from SDK
await client.tui.appendPrompt({ body: { text: "Hello" } })
await client.tui.submitPrompt()
```

---

## Reporting platform-specific bugs

When reporting issues, include:
1. **Interface**: TUI, Desktop, Web, SDK, Extension
2. **Platform**: OS, version, desktop environment
3. **Version**: `opencode --version`
4. **Terminal** (for TUI): iTerm, Alacritty, Terminal.app, etc.
5. **Error messages**: Full output, not screenshots if possible
