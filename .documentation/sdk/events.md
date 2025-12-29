# Event System

The OpenCode SDK provides real-time event streaming via Server-Sent Events (SSE). This allows you to monitor session activity, message updates, file changes, and system events as they happen.

## Streaming Endpoints

### Directory Events (`/event`)

Subscribe to events for the current directory context.

```typescript
const stream = await client.event.subscribe({
  query: { directory: "/path/to/project" }  // Optional
})

for await (const event of stream.stream!) {
  console.log(event.type, event.properties)
}
```

### Global Events (`/global/event`)

Subscribe to events across all directories.

```typescript
const stream = await client.global.event()

for await (const event of stream.stream!) {
  console.log(`Event from ${event.directory}:`, event.payload)
}
```

**GlobalEvent structure:**
```typescript
type GlobalEvent = {
  directory: string    // Which directory/project this event is from
  payload: Event       // The actual event
}
```

---

## Consumption Patterns

### Async Generator (Recommended)

```typescript
const stream = await client.event.subscribe()

for await (const event of stream.stream!) {
  switch (event.type) {
    case "session.created":
      console.log("New session:", event.properties.info.id)
      break
    case "message.part.updated":
      handlePartUpdate(event.properties.part)
      break
  }
}
```

### Callback-Based

```typescript
const stream = await client.event.subscribe({
  onSseEvent: (event) => {
    console.log("Event:", event)
  },
  onSseError: (error) => {
    console.error("SSE Error:", error)
  }
})
```

### With AbortController

```typescript
const controller = new AbortController()

const stream = await client.event.subscribe({
  signal: controller.signal
})

// Later, to stop:
controller.abort()
```

---

## Connection Management

### Automatic Reconnection

The SSE client handles reconnection automatically with exponential backoff:

| Setting | Default | Description |
|---------|---------|-------------|
| `sseDefaultRetryDelay` | 3000ms | Initial retry delay |
| `sseMaxRetryDelay` | 30000ms | Maximum retry delay |
| `sseMaxRetryAttempts` | - | Max reconnection attempts |

```typescript
const stream = await client.event.subscribe({
  sseDefaultRetryDelay: 1000,
  sseMaxRetryDelay: 60000,
  sseMaxRetryAttempts: 10
})
```

### State Preservation with `Last-Event-ID`

The SDK automatically sends the `Last-Event-ID` header when reconnecting, allowing the server to resume from where you left off:

```typescript
// First connection receives events 1, 2, 3...
// Connection drops after event 5
// Reconnection sends Last-Event-ID: 5
// Server resumes from event 6
```

---

## Event Types

### Session Events

#### `session.created`

A new session was created.

```typescript
{
  type: "session.created",
  properties: {
    info: Session  // Full session object
  }
}
```

#### `session.updated`

Session was updated (title, share status, etc.).

```typescript
{
  type: "session.updated",
  properties: {
    info: Session
  }
}
```

#### `session.deleted`

Session was deleted.

```typescript
{
  type: "session.deleted",
  properties: {
    id: string
  }
}
```

#### `session.status`

Session status changed (idle, busy, retry).

```typescript
{
  type: "session.status",
  properties: {
    sessionID: string,
    status: SessionStatus
  }
}

// SessionStatus:
// { type: "idle" }
// { type: "busy" }
// { type: "retry", attempt: number, message: string, next: number }
```

#### `session.idle`

Session became idle.

```typescript
{
  type: "session.idle",
  properties: {
    sessionID: string
  }
}
```

#### `session.compacted`

Session messages were compacted.

```typescript
{
  type: "session.compacted",
  properties: {
    sessionID: string
  }
}
```

#### `session.error`

Session encountered an error.

```typescript
{
  type: "session.error",
  properties: {
    sessionID?: string,
    error?: unknown
  }
}
```

#### `session.diff`

Session diff is available.

```typescript
{
  type: "session.diff",
  properties: {
    sessionID: string,
    diffs: Array<FileDiff>
  }
}
```

---

### Message Events

#### `message.updated`

Message was updated.

```typescript
{
  type: "message.updated",
  properties: {
    info: Message  // UserMessage | AssistantMessage
  }
}
```

#### `message.removed`

Message was removed.

```typescript
{
  type: "message.removed",
  properties: {
    sessionID: string,
    messageID: string
  }
}
```

#### `message.part.updated`

A message part was created or updated. This is the primary event for streaming responses.

```typescript
{
  type: "message.part.updated",
  properties: {
    part: Part,
    delta?: string  // Incremental text delta (for streaming)
  }
}
```

**Use this to stream AI responses:**

```typescript
for await (const event of stream.stream!) {
  if (event.type === "message.part.updated") {
    const { part, delta } = event.properties
    if (part.type === "text" && delta) {
      process.stdout.write(delta)  // Stream text as it arrives
    }
  }
}
```

#### `message.part.removed`

A message part was removed.

```typescript
{
  type: "message.part.removed",
  properties: {
    sessionID: string,
    messageID: string,
    partID: string
  }
}
```

---

### Permission Events

#### `permission.updated`

A permission request was created or updated.

```typescript
{
  type: "permission.updated",
  properties: Permission
}

// Permission:
{
  id: string,
  type: string,
  pattern?: string | string[],
  sessionID: string,
  messageID: string,
  callID?: string,
  title: string,
  metadata: unknown,
  time: { created: number }
}
```

#### `permission.replied`

A permission request was answered.

```typescript
{
  type: "permission.replied",
  properties: {
    sessionID: string,
    permissionID: string,
    response: "once" | "always" | "reject"
  }
}
```

---

### File Events

#### `file.edited`

A file was edited.

```typescript
{
  type: "file.edited",
  properties: {
    file: string  // File path
  }
}
```

#### `file.watcher.updated`

File watcher detected a change.

```typescript
{
  type: "file.watcher.updated",
  properties: {
    file: string,
    event: "add" | "change" | "unlink"
  }
}
```

---

### VCS Events

#### `vcs.branch.updated`

Git branch changed.

```typescript
{
  type: "vcs.branch.updated",
  properties: {
    branch?: string
  }
}
```

---

### Command Events

#### `command.executed`

A command was executed.

```typescript
{
  type: "command.executed",
  properties: {
    name: string,
    sessionID: string,
    arguments: string,
    messageID: string
  }
}
```

---

### Todo Events

#### `todo.updated`

Todo list was updated.

```typescript
{
  type: "todo.updated",
  properties: {
    sessionID: string,
    todos: Array<Todo>
  }
}
```

---

### PTY (Terminal) Events

#### `pty.created`

A terminal session was created.

```typescript
{
  type: "pty.created",
  properties: Pty
}
```

#### `pty.updated`

Terminal session was updated.

```typescript
{
  type: "pty.updated",
  properties: Pty
}
```

#### `pty.exited`

Terminal process exited.

```typescript
{
  type: "pty.exited",
  properties: Pty
}
```

#### `pty.deleted`

Terminal session was deleted.

```typescript
{
  type: "pty.deleted",
  properties: {
    id: string
  }
}
```

---

### TUI Events

#### `tui.prompt.append`

Append text to the TUI prompt.

```typescript
{
  type: "tui.prompt.append",
  properties: {
    text: string
  }
}
```

#### `tui.command.execute`

Execute a TUI command.

```typescript
{
  type: "tui.command.execute",
  properties: {
    command: string
  }
}
```

#### `tui.toast.show`

Show a toast notification.

```typescript
{
  type: "tui.toast.show",
  properties: {
    title?: string,
    message: string,
    variant: "info" | "success" | "warning" | "error",
    duration?: number
  }
}
```

---

### LSP Events

#### `lsp.client.diagnostics`

LSP diagnostics updated.

```typescript
{
  type: "lsp.client.diagnostics",
  properties: {
    diagnostics: unknown
  }
}
```

#### `lsp.updated`

LSP status changed.

```typescript
{
  type: "lsp.updated",
  properties: unknown
}
```

---

### MCP Events (v2)

#### `mcp.tools.changed`

MCP server tools changed.

```typescript
{
  type: "mcp.tools.changed",
  properties: {
    server: string
  }
}
```

---

### System Events

#### `server.instance.disposed`

Server instance was disposed.

```typescript
{
  type: "server.instance.disposed",
  properties: {}
}
```

#### `server.connected`

Server connection established.

```typescript
{
  type: "server.connected",
  properties: {}
}
```

#### `installation.updated`

Installation was updated.

```typescript
{
  type: "installation.updated",
  properties: {
    version: string
  }
}
```

#### `installation.update.available`

A new version is available.

```typescript
{
  type: "installation.update.available",
  properties: {
    current: string,
    latest: string
  }
}
```

---

### Project Events (v2)

#### `project.updated`

Project was updated.

```typescript
{
  type: "project.updated",
  properties: Project
}
```

---

## Example: Complete Event Handler

```typescript
import { createOpencodeClient, type Event } from "@opencode-ai/sdk"

const client = createOpencodeClient({ baseUrl: "http://localhost:4096" })

async function handleEvents() {
  const stream = await client.event.subscribe()

  for await (const event of stream.stream!) {
    switch (event.type) {
      // Session lifecycle
      case "session.created":
        console.log("Session created:", event.properties.info.title)
        break
      case "session.status":
        const { sessionID, status } = event.properties
        if (status.type === "busy") {
          console.log(`Session ${sessionID} is working...`)
        } else if (status.type === "idle") {
          console.log(`Session ${sessionID} finished`)
        }
        break

      // Streaming responses
      case "message.part.updated":
        const { part, delta } = event.properties
        if (part.type === "text" && delta) {
          process.stdout.write(delta)
        } else if (part.type === "tool") {
          if (part.state.status === "running") {
            console.log(`Running tool: ${part.tool}`)
          } else if (part.state.status === "completed") {
            console.log(`Tool ${part.tool} completed`)
          }
        }
        break

      // Permission requests
      case "permission.updated":
        const perm = event.properties
        console.log(`Permission request: ${perm.title}`)
        // Respond to permission
        await client.postSessionIdPermissionsPermissionId({
          path: { id: perm.sessionID, permissionID: perm.id },
          body: { response: "once" }
        })
        break

      // File changes
      case "file.edited":
        console.log(`File edited: ${event.properties.file}`)
        break

      // Errors
      case "session.error":
        console.error("Session error:", event.properties.error)
        break
    }
  }
}

handleEvents().catch(console.error)
```

---

## Event Type Union

All events form a discriminated union via the `type` field:

```typescript
type Event =
  | EventSessionCreated
  | EventSessionUpdated
  | EventSessionDeleted
  | EventSessionStatus
  | EventSessionIdle
  | EventSessionCompacted
  | EventSessionError
  | EventSessionDiff
  | EventMessageUpdated
  | EventMessageRemoved
  | EventMessagePartUpdated
  | EventMessagePartRemoved
  | EventPermissionUpdated
  | EventPermissionReplied
  | EventFileEdited
  | EventFileWatcherUpdated
  | EventVcsBranchUpdated
  | EventCommandExecuted
  | EventTodoUpdated
  | EventPtyCreated
  | EventPtyUpdated
  | EventPtyExited
  | EventPtyDeleted
  | EventTuiPromptAppend
  | EventTuiCommandExecute
  | EventTuiToastShow
  | EventLspClientDiagnostics
  | EventLspUpdated
  | EventServerInstanceDisposed
  | EventServerConnected
  | EventInstallationUpdated
  | EventInstallationUpdateAvailable
  | EventMcpToolsChanged      // v2 only
  | EventProjectUpdated       // v2 only
  | EventGlobalDisposed       // v2 only
```
