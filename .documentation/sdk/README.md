# OpenCode SDK Documentation

The OpenCode SDK (`@opencode-ai/sdk`) is a fully-typed TypeScript/JavaScript client library for interacting with the OpenCode server. It provides programmatic access to all OpenCode functionality for building automation, integrations, and tooling.

## What is "The Client"?

The SDK client is a **programmatic interface** to the OpenCode server - it is NOT the TUI (terminal user interface).

| Component | Description |
|-----------|-------------|
| **SDK Client** | Your JavaScript/TypeScript code making REST API calls to the server |
| **OpenCode Server** | Backend that manages sessions, runs tools, communicates with AI providers |
| **TUI** | The visual terminal interface (`opencode` command) - a separate frontend |

**Use the SDK when you want to:**
- Build custom integrations (VSCode extensions, CI/CD pipelines)
- Automate OpenCode from scripts
- Create your own UI/frontend
- Run OpenCode in headless/server mode

**Use the TUI when you want to:**
- Interactively chat with the AI in your terminal
- Visually see tool execution and file changes

The SDK can optionally control a running TUI via `client.tui.*` methods, but this is a special case for building TUI extensions.

## Installation

```bash
npm install @opencode-ai/sdk
# or
pnpm add @opencode-ai/sdk
# or
bun add @opencode-ai/sdk
```

## Package Exports

The SDK provides multiple entry points:

| Import Path | Description |
|-------------|-------------|
| `@opencode-ai/sdk` | Main entry - exports client, server, and `createOpencode()` |
| `@opencode-ai/sdk/client` | Client-only exports |
| `@opencode-ai/sdk/server` | Server-only exports |
| `@opencode-ai/sdk/v2` | Version 2 API (same structure, additional features) |
| `@opencode-ai/sdk/v2/client` | V2 client-only |
| `@opencode-ai/sdk/v2/server` | V2 server-only |

## Quick Start

### Option 1: Create Server and Client Together

The simplest way to get started - spawns a server and returns a connected client:

```typescript
import { createOpencode } from "@opencode-ai/sdk"

const { server, client } = await createOpencode({
  port: 4096,
  config: {
    model: "anthropic/claude-sonnet-4-20250514",
  }
})

// Create a session
const session = await client.session.create({
  body: { title: "My Analysis Session" }
})

// Send a prompt and wait for completion
const response = await client.session.prompt({
  path: { id: session.data!.id },
  body: {
    parts: [{ type: "text", text: "Analyze the project structure" }]
  }
})

console.log(response.data)

// Clean up
server.close()
```

### Option 2: Connect to Existing Server

If you have an OpenCode server already running:

```typescript
import { createOpencodeClient } from "@opencode-ai/sdk"

const client = createOpencodeClient({
  baseUrl: "http://localhost:4096",
  directory: "/path/to/project"  // Sets x-opencode-directory header
})

// Use the client
const sessions = await client.session.list()
```

### Option 3: Spawn Server Only

Start a server programmatically for other clients to connect:

```typescript
import { createOpencodeServer } from "@opencode-ai/sdk"

const server = await createOpencodeServer({
  hostname: "127.0.0.1",
  port: 4096,
  timeout: 5000
})

console.log(`Server running at ${server.url}`)

// Later...
server.close()
```

## Architecture

The SDK is auto-generated from the OpenAPI specification using `@hey-api/openapi-ts`. This ensures:

- Complete type safety for all API calls
- Automatic updates when the API changes
- Consistent error handling patterns

### Client Structure

The `OpencodeClient` exposes 20 namespaces for different functionality areas:

```typescript
client.global      // Global events (SSE)
client.project     // Project management
client.pty         // Terminal sessions
client.config      // Configuration
client.tool        // Tool introspection (experimental)
client.instance    // Instance lifecycle
client.path        // Path information
client.vcs         // Version control
client.session     // Session management (core)
client.command     // Command registry
client.provider    // AI provider management
client.find        // Search operations
client.file        // File operations
client.app         // App utilities & agents
client.mcp         // MCP server management
client.lsp         // LSP status
client.formatter   // Formatter status
client.tui         // TUI control
client.auth        // Authentication
client.event       // Event streaming (SSE)
```

## Real-Time Events

The SDK supports Server-Sent Events (SSE) for real-time updates:

```typescript
// Subscribe to events for current directory
const stream = await client.event.subscribe()

for await (const event of stream.stream!) {
  switch (event.type) {
    case "session.created":
      console.log("New session:", event.properties.info)
      break
    case "message.part.updated":
      console.log("Part update:", event.properties.part)
      break
    // ... handle other events
  }
}
```

See [events.md](./events.md) for complete event documentation.

## Error Handling

All methods return a response object with `data` and `error` fields:

```typescript
const result = await client.session.get({
  path: { id: "invalid-id" }
})

if (result.error) {
  console.error("Error:", result.error)
} else {
  console.log("Session:", result.data)
}
```

Or use `throwOnError` for exception-based handling:

```typescript
try {
  const result = await client.session.get<true>({
    path: { id: "session-id" },
    throwOnError: true
  })
  // result.data is guaranteed to exist
} catch (error) {
  // Handle error
}
```

## Documentation Structure

- [server.md](./server.md) - Server creation utilities
- [client.md](./client.md) - Complete client API reference
- [events.md](./events.md) - Event types and streaming
- [types.md](./types.md) - Core type definitions

## v1 vs v2 API

Both versions share the same API structure. v2 adds:

- `onRequest` interceptor hook for request modification
- Additional event types (`EventMcpToolsChanged`, `EventProjectUpdated`)
- `skill` permission type
- `agent` field on `AssistantMessage`
- Part manipulation endpoints
- Session archiving support

For most use cases, v1 is sufficient. Use v2 if you need the additional features.
