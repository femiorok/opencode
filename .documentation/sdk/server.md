# Server Utilities

The SDK provides utilities for spawning and managing OpenCode server and TUI processes programmatically.

## Functions

### `createOpencodeServer(options?)`

Spawns an OpenCode server process and waits for it to become ready.

```typescript
import { createOpencodeServer } from "@opencode-ai/sdk"

const server = await createOpencodeServer({
  hostname: "127.0.0.1",
  port: 4096,
  timeout: 5000,
  config: {
    model: "anthropic/claude-sonnet-4-20250514",
    logLevel: "INFO"
  }
})

console.log(server.url) // "http://127.0.0.1:4096"

// Later, to stop the server:
server.close()
```

#### Options

```typescript
type ServerOptions = {
  hostname?: string      // Default: "127.0.0.1"
  port?: number          // Default: 4096
  signal?: AbortSignal   // For graceful shutdown
  timeout?: number       // Default: 5000ms - timeout waiting for server to start
  config?: Config        // OpenCode configuration object
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `hostname` | `string` | `"127.0.0.1"` | Network interface to bind to |
| `port` | `number` | `4096` | Port number for the server |
| `signal` | `AbortSignal` | - | Abort signal for cancellation |
| `timeout` | `number` | `5000` | Max time (ms) to wait for server startup |
| `config` | `Config` | `{}` | Full OpenCode configuration |

#### Return Value

```typescript
Promise<{
  url: string      // Full server URL (e.g., "http://127.0.0.1:4096")
  close(): void    // Kill the server process
}>
```

#### Behavior

1. Spawns `opencode serve --hostname=... --port=...` as a child process
2. Monitors stdout for the "opencode server listening on" message
3. Extracts and returns the URL from server output
4. Rejects the promise if:
   - Timeout is exceeded
   - Process exits unexpectedly
   - Process emits an error
   - AbortSignal is triggered

#### Configuration Passing

Configuration is passed to the server via the `OPENCODE_CONFIG_CONTENT` environment variable as JSON:

```typescript
const server = await createOpencodeServer({
  config: {
    model: "anthropic/claude-sonnet-4-20250514",
    disabled_providers: ["openai"],
    mcp: {
      "my-server": {
        type: "local",
        command: ["node", "server.js"]
      }
    }
  }
})
```

---

### `createOpencodeTui(options?)`

Spawns an OpenCode TUI (Terminal User Interface) application.

```typescript
import { createOpencodeTui } from "@opencode-ai/sdk"

const tui = createOpencodeTui({
  project: "my-project",
  model: "anthropic/claude-sonnet-4-20250514",
  session: "existing-session-id",
  agent: "build"
})

// TUI runs in terminal with inherited stdio
// Later, to stop:
tui.close()
```

#### Options

```typescript
type TuiOptions = {
  project?: string       // Project name/path
  model?: string         // Model to use (e.g., "anthropic/claude-3")
  session?: string       // Session ID to load
  agent?: string         // Agent name to start with
  signal?: AbortSignal   // For graceful shutdown
  config?: Config        // OpenCode configuration object
}
```

| Option | Type | Description |
|--------|------|-------------|
| `project` | `string` | Project name or path to open |
| `model` | `string` | Model identifier (provider/model format) |
| `session` | `string` | Existing session ID to resume |
| `agent` | `string` | Agent to start with (e.g., "build", "plan") |
| `signal` | `AbortSignal` | Abort signal for cancellation |
| `config` | `Config` | Full OpenCode configuration |

#### Return Value

```typescript
{
  close(): void    // Kill the TUI process
}
```

#### Behavior

- Spawns `opencode` with the specified CLI arguments
- Uses `stdio: "inherit"` - shares parent process stdio (terminal appears in current terminal)
- Non-blocking - returns immediately after spawning
- Configuration passed via `OPENCODE_CONFIG_CONTENT` environment variable

---

### `createOpencode(options?)`

Convenience function that creates both a server and a connected client.

```typescript
import { createOpencode } from "@opencode-ai/sdk"

const { server, client } = await createOpencode({
  port: 4096,
  config: {
    model: "anthropic/claude-sonnet-4-20250514"
  }
})

// Use the client
const session = await client.session.create()

// Clean up
server.close()
```

#### Options

Same as `ServerOptions` for `createOpencodeServer`.

#### Return Value

```typescript
Promise<{
  server: {
    url: string
    close(): void
  }
  client: OpencodeClient
}>
```

The returned `client` is pre-configured with `baseUrl` set to `server.url`.

---

## Usage Patterns

### With AbortController

```typescript
const controller = new AbortController()

// Start server with abort support
const server = await createOpencodeServer({
  signal: controller.signal
})

// Later, gracefully abort
controller.abort()
```

### With Timeout Handling

```typescript
try {
  const server = await createOpencodeServer({
    timeout: 10000  // 10 seconds
  })
} catch (error) {
  if (error.message.includes("Timeout")) {
    console.error("Server took too long to start")
  }
}
```

### Embedded Server for Tests

```typescript
import { createOpencode } from "@opencode-ai/sdk"

describe("My Integration Tests", () => {
  let server: { url: string; close(): void }
  let client: OpencodeClient

  beforeAll(async () => {
    const result = await createOpencode({ port: 0 })  // Random port
    server = result.server
    client = result.client
  })

  afterAll(() => {
    server.close()
  })

  test("create session", async () => {
    const result = await client.session.create()
    expect(result.data).toBeDefined()
  })
})
```

### Custom Server Configuration

```typescript
const server = await createOpencodeServer({
  hostname: "0.0.0.0",  // Bind to all interfaces
  port: 8080,
  config: {
    logLevel: "DEBUG",
    model: "anthropic/claude-sonnet-4-20250514",
    small_model: "anthropic/claude-3-haiku-20240307",
    mcp: {
      "filesystem": {
        type: "local",
        command: ["npx", "-y", "@modelcontextprotocol/server-filesystem", "/tmp"]
      }
    },
    permission: {
      default: "allow"
    }
  }
})
```

---

## Error Handling

### Server Startup Errors

```typescript
try {
  const server = await createOpencodeServer()
} catch (error) {
  // Common errors:
  // - "Timeout waiting for server to start after 5000ms"
  // - "Server exited with code 1\nServer output: ..."
  // - "Aborted"
  console.error(error.message)
}
```

### Process Exit Handling

The server promise rejects if the process exits before the "listening" message:

```typescript
try {
  const server = await createOpencodeServer({
    config: { /* invalid config */ }
  })
} catch (error) {
  // Error message includes server output for debugging
  console.error(error.message)
  // "Server exited with code 1
  //  Server output: Error: Invalid configuration..."
}
```

---

## Implementation Notes

- Both functions spawn the `opencode` binary from `PATH`
- Server uses stdout/stderr monitoring to detect readiness
- TUI inherits stdio for interactive terminal use
- Config is serialized to JSON in `OPENCODE_CONFIG_CONTENT` env var
- Calling `close()` sends `SIGTERM` to the child process
