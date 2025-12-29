# Client API Reference

The `OpencodeClient` provides access to all OpenCode server functionality through typed namespace methods.

## Creating a Client

```typescript
import { createOpencodeClient } from "@opencode-ai/sdk"

const client = createOpencodeClient({
  baseUrl: "http://localhost:4096",
  directory: "/path/to/project"  // Optional: sets x-opencode-directory header
})
```

### Configuration Options

```typescript
type Config = {
  baseUrl?: string                              // Server URL (required)
  fetch?: (req: Request) => Promise<Response>   // Custom fetch implementation
  directory?: string                            // Project directory (added as header)
  headers?: Record<string, string>              // Custom headers
}
```

### Directory Header

When `directory` is provided, it's automatically added as the `x-opencode-directory` header on all requests. This tells the server which project context to use.

---

## Namespace Reference

### `client.global`

Global events across all directories.

#### `global.event(options?)`

Get SSE stream of global events.

```typescript
const stream = await client.global.event()
for await (const event of stream.stream!) {
  console.log(`Event from ${event.directory}:`, event.payload)
}
```

**Returns:** `Promise<ServerSentEventsResult<GlobalEvent>>`

---

### `client.project`

Project management.

#### `project.list(options?)`

List all projects.

```typescript
const result = await client.project.list()
// result.data: Array<Project>
```

#### `project.current(options?)`

Get the current project.

```typescript
const result = await client.project.current()
// result.data: Project
```

---

### `client.pty`

Pseudo-terminal (PTY) session management.

#### `pty.list(options?)`

List all PTY sessions.

```typescript
const result = await client.pty.list()
// result.data: Array<Pty>
```

#### `pty.create(options?)`

Create a new PTY session.

```typescript
const result = await client.pty.create({
  body: {
    command: "bash",
    args: ["-l"],
    cwd: "/home/user",
    title: "My Terminal",
    env: { TERM: "xterm-256color" }
  }
})
// result.data: Pty
```

#### `pty.get(options)`

Get PTY session info.

```typescript
const result = await client.pty.get({
  path: { id: "pty-id" }
})
// result.data: Pty
```

#### `pty.update(options)`

Update PTY session (title, size).

```typescript
const result = await client.pty.update({
  path: { id: "pty-id" },
  body: {
    title: "New Title",
    size: { rows: 24, cols: 80 }
  }
})
```

#### `pty.remove(options)`

Remove a PTY session.

```typescript
await client.pty.remove({
  path: { id: "pty-id" }
})
```

#### `pty.connect(options)`

Connect to a PTY session.

```typescript
await client.pty.connect({
  path: { id: "pty-id" }
})
```

---

### `client.config`

Configuration management.

#### `config.get(options?)`

Get current configuration.

```typescript
const result = await client.config.get()
// result.data: Config
```

#### `config.update(options?)`

Update configuration.

```typescript
const result = await client.config.update({
  body: {
    model: "anthropic/claude-sonnet-4-20250514",
    theme: "dark"
  }
})
```

#### `config.providers(options?)`

List all providers with their models.

```typescript
const result = await client.config.providers()
// result.data: { providers: Array<Provider>, default: Record<string, string> }
```

---

### `client.tool`

Tool introspection (experimental).

#### `tool.ids(options?)`

List all tool IDs (built-in and dynamically registered).

```typescript
const result = await client.tool.ids()
// result.data: Array<string>
```

#### `tool.list(options)`

List tools with JSON schema parameters for a specific provider/model.

```typescript
const result = await client.tool.list({
  query: {
    provider: "anthropic",
    model: "claude-sonnet-4-20250514"
  }
})
// result.data: Array<ToolListItem>
```

---

### `client.instance`

Instance lifecycle management.

#### `instance.dispose(options?)`

Dispose the current instance.

```typescript
await client.instance.dispose()
```

---

### `client.path`

Path information.

#### `path.get(options?)`

Get path information for the current context.

```typescript
const result = await client.path.get()
// result.data: { state: string, config: string, worktree: string, directory: string }
```

---

### `client.vcs`

Version control information.

#### `vcs.get(options?)`

Get VCS info for the current instance.

```typescript
const result = await client.vcs.get()
// result.data: { branch: string }
```

---

### `client.session`

Core session management - the primary API for interacting with OpenCode.

#### `session.list(options?)`

List all sessions.

```typescript
const result = await client.session.list()
// result.data: Array<Session>
```

#### `session.create(options?)`

Create a new session.

```typescript
const result = await client.session.create({
  body: {
    parentID: "parent-session-id",  // Optional: for child sessions
    title: "My Session"
  }
})
// result.data: Session
```

#### `session.get(options)`

Get session details.

```typescript
const result = await client.session.get({
  path: { id: "session-id" }
})
// result.data: Session
```

#### `session.update(options)`

Update session properties.

```typescript
const result = await client.session.update({
  path: { id: "session-id" },
  body: { title: "New Title" }
})
```

#### `session.delete(options)`

Delete a session and all its data.

```typescript
await client.session.delete({
  path: { id: "session-id" }
})
```

#### `session.status(options?)`

Get status of all sessions.

```typescript
const result = await client.session.status()
// result.data: Record<string, SessionStatus>
// SessionStatus: { type: "idle" } | { type: "busy" } | { type: "retry", attempt, message, next }
```

#### `session.children(options)`

Get a session's child sessions.

```typescript
const result = await client.session.children({
  path: { id: "session-id" }
})
// result.data: Array<Session>
```

#### `session.todo(options)`

Get the todo list for a session.

```typescript
const result = await client.session.todo({
  path: { id: "session-id" }
})
// result.data: Array<Todo>
```

#### `session.fork(options)`

Fork an existing session at a specific message.

```typescript
const result = await client.session.fork({
  path: { id: "session-id" },
  body: { messageID: "message-id" }  // Optional: fork from specific message
})
// result.data: Session (new forked session)
```

#### `session.abort(options)`

Abort a running session.

```typescript
await client.session.abort({
  path: { id: "session-id" }
})
```

#### `session.share(options)`

Share a session publicly.

```typescript
const result = await client.session.share({
  path: { id: "session-id" }
})
// result.data: Session (with share.url populated)
```

#### `session.unshare(options)`

Remove public sharing from a session.

```typescript
await client.session.unshare({
  path: { id: "session-id" }
})
```

#### `session.diff(options)`

Get the diff for this session.

```typescript
const result = await client.session.diff({
  path: { id: "session-id" },
  query: { messageID: "message-id" }  // Optional: diff at specific message
})
// result.data: Array<FileDiff>
```

#### `session.summarize(options)`

Summarize the session.

```typescript
await client.session.summarize({
  path: { id: "session-id" },
  body: {
    providerID: "anthropic",
    modelID: "claude-sonnet-4-20250514"
  }
})
```

#### `session.init(options)`

Analyze the app and create an AGENTS.md file.

```typescript
await client.session.init({
  path: { id: "session-id" },
  body: {
    modelID: "claude-sonnet-4-20250514",
    providerID: "anthropic",
    messageID: "message-id"
  }
})
```

#### `session.messages(options)`

List messages for a session.

```typescript
const result = await client.session.messages({
  path: { id: "session-id" },
  query: { limit: 50 }  // Optional: limit results
})
// result.data: Array<{ info: Message, parts: Array<Part> }>
```

#### `session.message(options)`

Get a specific message.

```typescript
const result = await client.session.message({
  path: { id: "session-id", messageID: "message-id" }
})
// result.data: { info: Message, parts: Array<Part> }
```

#### `session.prompt(options)`

Send a message and wait for completion. This is the primary method for interacting with the AI.

```typescript
const result = await client.session.prompt({
  path: { id: "session-id" },
  body: {
    parts: [
      { type: "text", text: "Explain this code" },
      { type: "file", mime: "text/plain", url: "file:///path/to/file.ts" }
    ],
    model: {
      providerID: "anthropic",
      modelID: "claude-sonnet-4-20250514"
    },
    agent: "build",           // Optional: use specific agent
    system: "Custom system prompt",  // Optional
    tools: { bash: true, edit: false }  // Optional: enable/disable tools
  }
})
// result.data: { info: AssistantMessage, parts: Array<Part> }
```

**Input Part Types:**

```typescript
type TextPartInput = { type: "text", text: string }
type FilePartInput = { type: "file", mime: string, url: string }
type AgentPartInput = { type: "agent", name: string }
type SubtaskPartInput = { type: "subtask", prompt: string, description: string, agent: string }
```

#### `session.promptAsync(options)`

Send a message and return immediately (non-blocking).

```typescript
await client.session.promptAsync({
  path: { id: "session-id" },
  body: {
    parts: [{ type: "text", text: "Run tests" }]
  }
})
// Returns 204 No Content - use events to track progress
```

#### `session.command(options)`

Send a slash command to a session.

```typescript
const result = await client.session.command({
  path: { id: "session-id" },
  body: {
    command: "compact",
    arguments: "--force",
    agent: "build",
    model: "anthropic/claude-sonnet-4-20250514"
  }
})
```

#### `session.shell(options)`

Run a shell command in a session.

```typescript
const result = await client.session.shell({
  path: { id: "session-id" },
  body: {
    agent: "build",
    command: "npm test",
    model: { providerID: "anthropic", modelID: "claude-sonnet-4-20250514" }
  }
})
```

#### `session.revert(options)`

Revert a message (undo changes).

```typescript
const result = await client.session.revert({
  path: { id: "session-id" },
  body: {
    messageID: "message-id",
    partID: "part-id"  // Optional: revert specific part
  }
})
```

#### `session.unrevert(options)`

Restore all reverted messages.

```typescript
await client.session.unrevert({
  path: { id: "session-id" }
})
```

---

### `client.command`

Command registry.

#### `command.list(options?)`

List all available commands.

```typescript
const result = await client.command.list()
// result.data: Array<Command>
```

---

### `client.provider`

AI provider management.

#### `provider.list(options?)`

List all providers with their models and status.

```typescript
const result = await client.provider.list()
// result.data: Array<Provider>
```

#### `provider.auth(options?)`

Get available authentication methods for providers.

```typescript
const result = await client.provider.auth()
// result.data: Record<string, Array<ProviderAuthMethod>>
```

#### `provider.oauth.authorize(options)`

Start OAuth authorization for a provider.

```typescript
const result = await client.provider.oauth.authorize({
  path: { id: "provider-id" },
  body: { method: 0 }
})
// result.data: { url: string }  // OAuth URL to open
```

#### `provider.oauth.callback(options)`

Complete OAuth callback.

```typescript
await client.provider.oauth.callback({
  path: { id: "provider-id" },
  body: { method: 0, code: "auth-code" }
})
```

---

### `client.find`

Search operations.

#### `find.text(options)`

Find text in files using regex.

```typescript
const result = await client.find.text({
  query: { pattern: "function\\s+\\w+" }
})
// result.data: matches with line numbers and submatches
```

#### `find.files(options)`

Find files by name/pattern.

```typescript
const result = await client.find.files({
  query: { query: "*.ts", dirs: "false" }
})
// result.data: Array<string>  // File paths
```

#### `find.symbols(options)`

Find workspace symbols.

```typescript
const result = await client.find.symbols({
  query: { query: "MyClass" }
})
// result.data: Array<Symbol>
```

---

### `client.file`

File operations.

#### `file.list(options)`

List files and directories.

```typescript
const result = await client.file.list({
  query: { path: "/src" }
})
// result.data: Array<FileNode>
```

#### `file.read(options)`

Read a file.

```typescript
const result = await client.file.read({
  query: { path: "/src/index.ts" }
})
// result.data: FileContent
```

#### `file.status(options?)`

Get file status (modified files, etc.).

```typescript
const result = await client.file.status()
// result.data: Array<File>
```

---

### `client.app`

Application utilities.

#### `app.log(options?)`

Write a log entry to the server logs.

```typescript
await client.app.log({
  body: {
    service: "my-integration",
    level: "info",
    message: "Something happened",
    extra: { key: "value" }
  }
})
```

**Log Levels:** `"debug" | "info" | "warn" | "error"`

#### `app.agents(options?)`

List all available agents.

```typescript
const result = await client.app.agents()
// result.data: Array<Agent>
```

---

### `client.mcp`

Model Context Protocol server management.

#### `mcp.status(options?)`

Get MCP server status.

```typescript
const result = await client.mcp.status()
// result.data: Record<string, McpStatus>
// McpStatus: McpStatusConnected | McpStatusDisabled | McpStatusFailed | McpStatusNeedsAuth
```

#### `mcp.add(options?)`

Add MCP server dynamically.

```typescript
await client.mcp.add({
  body: {
    name: "my-server",
    config: {
      type: "local",
      command: ["node", "server.js"],
      environment: { API_KEY: "xxx" }
    }
    // Or for remote:
    // config: { type: "remote", url: "https://...", headers: {} }
  }
})
```

#### `mcp.connect(options)`

Connect an MCP server.

```typescript
await client.mcp.connect({
  path: { name: "my-server" }
})
```

#### `mcp.disconnect(options)`

Disconnect an MCP server.

```typescript
await client.mcp.disconnect({
  path: { name: "my-server" }
})
```

#### `mcp.auth.start(options)`

Start OAuth flow for MCP server.

```typescript
const result = await client.mcp.auth.start({
  path: { name: "my-server" }
})
// result.data: { authorizationUrl: string }
```

#### `mcp.auth.callback(options)`

Complete OAuth with authorization code.

```typescript
await client.mcp.auth.callback({
  path: { name: "my-server" },
  body: { code: "auth-code" }
})
```

#### `mcp.auth.authenticate(options)`

Start OAuth and open browser automatically.

```typescript
await client.mcp.auth.authenticate({
  path: { name: "my-server" }
})
```

#### `mcp.auth.remove(options)`

Remove OAuth credentials.

```typescript
await client.mcp.auth.remove({
  path: { name: "my-server" }
})
```

---

### `client.lsp`

Language Server Protocol status.

#### `lsp.status(options?)`

Get LSP server status.

```typescript
const result = await client.lsp.status()
// result.data: Array<LspStatus>
```

---

### `client.formatter`

Formatter status.

#### `formatter.status(options?)`

Get formatter status.

```typescript
const result = await client.formatter.status()
// result.data: Array<FormatterStatus>
```

---

### `client.tui`

Terminal UI control (for controlling the TUI remotely).

#### `tui.appendPrompt(options?)`

Append text to the TUI prompt.

```typescript
await client.tui.appendPrompt({
  body: { text: "Additional text" }
})
```

#### `tui.submitPrompt(options?)`

Submit the current prompt.

```typescript
await client.tui.submitPrompt()
```

#### `tui.clearPrompt(options?)`

Clear the current prompt.

```typescript
await client.tui.clearPrompt()
```

#### `tui.openHelp(options?)`

Open the help dialog.

```typescript
await client.tui.openHelp()
```

#### `tui.openSessions(options?)`

Open the session list dialog.

```typescript
await client.tui.openSessions()
```

#### `tui.openThemes(options?)`

Open the theme dialog.

```typescript
await client.tui.openThemes()
```

#### `tui.openModels(options?)`

Open the model selection dialog.

```typescript
await client.tui.openModels()
```

#### `tui.executeCommand(options?)`

Execute a TUI command.

```typescript
await client.tui.executeCommand({
  body: { command: "agent_cycle" }
})
```

#### `tui.showToast(options?)`

Show a toast notification.

```typescript
await client.tui.showToast({
  body: {
    title: "Success",
    message: "Operation completed",
    variant: "success",  // "info" | "success" | "warning" | "error"
    duration: 3000
  }
})
```

#### `tui.publish(options?)`

Publish a TUI event.

```typescript
await client.tui.publish({
  body: { type: "tui.prompt.append", properties: { text: "Hello" } }
})
```

#### `tui.control.next(options?)`

Get the next TUI request from the queue.

```typescript
const result = await client.tui.control.next()
// result.data: { path: string, body: unknown }
```

#### `tui.control.response(options?)`

Submit a response to TUI request queue.

```typescript
await client.tui.control.response({
  body: { /* response data */ }
})
```

---

### `client.auth`

Authentication management.

#### `auth.set(options)`

Set authentication credentials for a provider.

```typescript
await client.auth.set({
  path: { id: "anthropic" },
  body: {
    type: "api",
    key: "sk-ant-..."
  }
  // Or OAuth:
  // body: { type: "oauth", refresh: "...", access: "...", expires: 123456 }
})
```

---

### `client.event`

Event streaming.

#### `event.subscribe(options?)`

Subscribe to SSE events for the current directory.

```typescript
const stream = await client.event.subscribe({
  query: { directory: "/path/to/project" }  // Optional
})

for await (const event of stream.stream!) {
  console.log(event.type, event.properties)
}
```

See [events.md](./events.md) for complete event documentation.

---

### `client.postSessionIdPermissionsPermissionId(options)`

Respond to a permission request.

```typescript
await client.postSessionIdPermissionsPermissionId({
  path: { id: "session-id", permissionID: "permission-id" },
  body: { response: "once" }  // "once" | "always" | "reject"
})
```

---

## Error Handling

All methods return a result object:

```typescript
type Result<T, E> = {
  data?: T
  error?: E
  request?: Request
  response?: Response
}
```

Check for errors:

```typescript
const result = await client.session.get({
  path: { id: "invalid" }
})

if (result.error) {
  console.error("Error:", result.error)
} else {
  console.log("Session:", result.data)
}
```

Use `throwOnError` for exceptions:

```typescript
const result = await client.session.get<true>({
  path: { id: "session-id" },
  throwOnError: true
})
// Throws if error, otherwise result.data is guaranteed
```
