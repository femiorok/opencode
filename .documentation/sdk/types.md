# Core Types Reference

This document covers the main types used throughout the OpenCode SDK. All types are exported from `@opencode-ai/sdk`.

## Session

The primary container for a conversation with the AI.

```typescript
type Session = {
  id: string              // Unique session identifier
  projectID: string       // Associated project
  directory: string       // Working directory
  parentID?: string       // Parent session ID (for forks/children)
  title: string           // Session title
  version: string         // Session version (for optimistic locking)

  time: {
    created: number       // Unix timestamp
    updated: number       // Last update timestamp
    compacting?: number   // Currently compacting (timestamp)
    archived?: number     // Archived timestamp (v2)
  }

  summary?: {
    additions: number     // Lines added
    deletions: number     // Lines removed
    files: number         // Files changed
    diffs?: Array<FileDiff>
  }

  share?: {
    url: string           // Public share URL
  }

  revert?: {
    messageID: string     // Message being reverted
    partID?: string       // Specific part being reverted
    snapshot?: string     // Snapshot data
    diff?: string         // Diff data
  }
}
```

---

## Messages

### UserMessage

A message sent by the user.

```typescript
type UserMessage = {
  id: string
  sessionID: string
  role: "user"

  time: {
    created: number
  }

  agent: string           // Which agent mode
  model: {
    providerID: string
    modelID: string
  }
  system?: string         // Custom system prompt
  tools?: Record<string, boolean>  // Tool overrides

  summary?: {
    title?: string
    body?: string
    diffs: Array<FileDiff>
  }
}
```

### AssistantMessage

A message from the AI assistant.

```typescript
type AssistantMessage = {
  id: string
  sessionID: string
  role: "assistant"

  time: {
    created: number
    completed?: number    // When response finished
  }

  parentID: string        // Parent user message
  modelID: string
  providerID: string
  mode: string            // Agent mode used
  agent: string           // Agent name (v2)

  path: {
    cwd: string           // Current working directory
    root: string          // Project root
  }

  cost: number            // API cost in dollars
  tokens: {
    input: number
    output: number
    reasoning: number     // Reasoning tokens (if applicable)
    cache: {
      read: number        // Cache hits
      write: number       // Cache writes
    }
  }

  finish?: string         // Finish reason
  summary?: boolean       // Is a summary message

  error?: MessageError    // Error if failed
}
```

### Message Union

```typescript
type Message = UserMessage | AssistantMessage
```

---

## Message Parts

Parts are the components of messages (text, tool calls, files, etc.).

### TextPart

Plain text content.

```typescript
type TextPart = {
  type: "text"
  text: string
  synthetic?: boolean     // AI-generated vs user input
  ignored?: boolean       // Marked as ignored
  time?: {
    start: number
    end?: number
  }
}
```

### ReasoningPart

Chain-of-thought reasoning (for models that support it).

```typescript
type ReasoningPart = {
  type: "reasoning"
  text: string
  time: {
    start: number
    end?: number
  }
}
```

### FilePart

File reference or attachment.

```typescript
type FilePart = {
  type: "file"
  mime: string            // MIME type
  filename?: string
  url: string             // File URL or reference
  source?: FilePartSource
}

type FilePartSource =
  | { type: "file"; path: string; text: { value: string; start: number; end: number } }
  | { type: "symbol"; path: string; range: unknown; name: string; kind: string }
```

### ToolPart

A tool invocation and its result.

```typescript
type ToolPart = {
  type: "tool"
  callID: string          // Unique invocation ID
  tool: string            // Tool name (e.g., "bash", "edit", "read")
  state: ToolState
  metadata?: unknown
}

type ToolState =
  | ToolStatePending
  | ToolStateRunning
  | ToolStateCompleted
  | ToolStateError

type ToolStatePending = {
  status: "pending"
  input: unknown          // Tool input parameters
  raw: string             // Raw input string
}

type ToolStateRunning = {
  status: "running"
  input: unknown
  title?: string
  metadata?: unknown
  time: { start: number }
}

type ToolStateCompleted = {
  status: "completed"
  input: unknown
  output: string          // Tool output
  title: string
  metadata: unknown
  time: {
    start: number
    end: number
    compacted?: number    // If output was compacted
  }
  attachments?: Array<FilePart>
}

type ToolStateError = {
  status: "error"
  input: unknown
  error: string           // Error message
  metadata?: unknown
  time: {
    start: number
    end: number
  }
}
```

### StepStartPart

Marks the start of an agent step.

```typescript
type StepStartPart = {
  type: "step-start"
  snapshot?: string       // Checkpoint snapshot
}
```

### StepFinishPart

Marks the end of an agent step.

```typescript
type StepFinishPart = {
  type: "step-finish"
  reason: string          // Why step finished
  snapshot?: string
  cost: number
  tokens: {
    input: number
    output: number
    reasoning: number
    cache: { read: number; write: number }
  }
}
```

### SnapshotPart

A state snapshot.

```typescript
type SnapshotPart = {
  type: "snapshot"
  snapshot: string        // Serialized state
}
```

### PatchPart

File patch information.

```typescript
type PatchPart = {
  type: "patch"
  hash: string
  files: Array<string>    // Affected files
}
```

### AgentPart

Agent invocation.

```typescript
type AgentPart = {
  type: "agent"
  name: string            // Agent name
  source?: {
    value: string
    start: number
    end: number
  }
}
```

### SubtaskPart

A subtask spawned by the agent.

```typescript
type SubtaskPart = {
  type: "subtask"
  prompt: string
  description: string
  agent: string
  command?: string        // v2 only
}
```

### RetryPart

Retry information after an error.

```typescript
type RetryPart = {
  type: "retry"
  attempt: number
  error: ApiError
  time: {
    created: number
  }
}
```

### CompactionPart

Indicates message compaction occurred.

```typescript
type CompactionPart = {
  type: "compaction"
  auto: boolean           // Automatic vs manual
}
```

### Part Union

```typescript
type Part =
  | TextPart
  | ReasoningPart
  | FilePart
  | ToolPart
  | StepStartPart
  | StepFinishPart
  | SnapshotPart
  | PatchPart
  | AgentPart
  | SubtaskPart
  | RetryPart
  | CompactionPart
```

---

## Error Types

### ProviderAuthError

Authentication failed with a provider.

```typescript
type ProviderAuthError = {
  name: "ProviderAuthError"
  data: {
    providerID: string
    message: string
  }
}
```

### ApiError

API request failed.

```typescript
type ApiError = {
  name: "APIError"
  data: {
    message: string
    statusCode?: number
    isRetryable: boolean
    responseHeaders?: Record<string, string>
    responseBody?: string
    metadata?: Record<string, string>  // v2
  }
}
```

### UnknownError

Unknown/unexpected error.

```typescript
type UnknownError = {
  name: "UnknownError"
  data: {
    message: string
  }
}
```

### MessageOutputLengthError

Output exceeded maximum length.

```typescript
type MessageOutputLengthError = {
  name: "MessageOutputLengthError"
  data: {}
}
```

### MessageAbortedError

Message was aborted.

```typescript
type MessageAbortedError = {
  name: "MessageAbortedError"
  data: {}
}
```

### MessageError Union

```typescript
type MessageError =
  | ProviderAuthError
  | ApiError
  | UnknownError
  | MessageOutputLengthError
  | MessageAbortedError
```

---

## Session Status

```typescript
type SessionStatus =
  | { type: "idle" }
  | { type: "busy" }
  | { type: "retry"; attempt: number; message: string; next: number }
```

---

## Permission

A permission request requiring user approval.

```typescript
type Permission = {
  id: string
  type: string            // Permission type
  pattern?: string | Array<string>
  sessionID: string
  messageID: string
  callID?: string         // Tool call ID
  title: string
  metadata: unknown
  time: {
    created: number
  }
}
```

---

## Project

```typescript
type Project = {
  id: string
  worktree: string        // Git worktree path
  vcs?: "git"
  name?: string           // v2
  icon?: {                // v2
    url?: string
    color?: string
  }
  time: {
    created: number
    updated: number
    initialized?: number
  }
  vcsDir?: string         // v1 only
}
```

---

## PTY (Terminal)

```typescript
type Pty = {
  id: string
  title: string
  command: string
  args: Array<string>
  cwd: string
  status: "running" | "exited"
  pid: number
}
```

---

## Agent

```typescript
type Agent = {
  name: string
  description?: string
  mode: "subagent" | "primary" | "all"
  native?: boolean        // v2
  hidden?: boolean        // v2
  default?: boolean       // v2
  topP?: number
  temperature?: number
  color?: string

  permission: {
    edit: "ask" | "allow" | "deny"
    bash: Record<string, "ask" | "allow" | "deny">
    skill?: Record<string, "ask" | "allow" | "deny">  // v2
    webfetch?: "ask" | "allow" | "deny"
    doom_loop?: "ask" | "allow" | "deny"
    external_directory?: "ask" | "allow" | "deny"
  }

  model?: {
    modelID: string
    providerID: string
  }

  prompt?: string
  tools: Record<string, boolean>
  options: Record<string, unknown>
  maxSteps?: number
}
```

---

## Model

```typescript
type Model = {
  id: string
  providerID: string

  api: {
    id: string
    url: string
    npm: string
  }

  name: string
  family?: string         // v2

  capabilities: {
    temperature: boolean
    reasoning: boolean
    attachment: boolean
    toolcall: boolean
    input: {
      text: boolean
      audio: boolean
      image: boolean
      video: boolean
      pdf: boolean
    }
    output: {
      text: boolean
      audio: boolean
      image: boolean
      video: boolean
      pdf: boolean
    }
    interleaved: boolean | { field: string }  // v2
  }

  cost: {
    input: number         // Per million tokens
    output: number
    cache: {
      read: number
      write: number
    }
    experimentalOver200K?: number
  }

  limit: {
    context: number       // Max context tokens
    output: number        // Max output tokens
  }

  status: "alpha" | "beta" | "deprecated" | "active"
  options: Record<string, unknown>
  headers: Record<string, string>
  release_date?: string   // v2
}
```

---

## Provider

```typescript
type Provider = {
  id: string
  name: string
  api: {
    id: string
    url: string
    npm: string
  }
  models: Array<Model>
  status: "connected" | "disconnected" | "error"
}
```

---

## Auth

Authentication credentials.

```typescript
type Auth =
  | { type: "oauth"; refresh: string; access: string; expires: number; enterpriseUrl?: string }
  | { type: "api"; key: string }
  | { type: "wellknown"; key: string; token: string }
```

---

## MCP Configuration

### McpLocalConfig

Local MCP server (subprocess).

```typescript
type McpLocalConfig = {
  type: "local"
  command: Array<string>  // Command and args
  environment?: Record<string, string>
  enabled?: boolean
  timeout?: number
}
```

### McpRemoteConfig

Remote MCP server.

```typescript
type McpRemoteConfig = {
  type: "remote"
  url: string
  enabled?: boolean
  headers?: Record<string, string>
  oauth?: {
    clientId: string
    scopes: Array<string>
    pkce: boolean
  }
  timeout?: number
}
```

---

## MCP Status

```typescript
type McpStatus =
  | McpStatusConnected
  | McpStatusDisabled
  | McpStatusFailed
  | McpStatusNeedsAuth
  | McpStatusNeedsClientRegistration

type McpStatusConnected = {
  status: "connected"
  tools: Array<unknown>
  resources: Array<unknown>
  prompts: Array<unknown>
}

type McpStatusDisabled = {
  status: "disabled"
}

type McpStatusFailed = {
  status: "failed"
  error: string
}

type McpStatusNeedsAuth = {
  status: "needs_auth"
  authorizationUrl: string
}

type McpStatusNeedsClientRegistration = {
  status: "needs_client_registration"
  registrationUrl: string
}
```

---

## Todo

```typescript
type Todo = {
  id: string
  content: string
  status: "pending" | "in_progress" | "completed"
  priority: number
}
```

---

## FileDiff

```typescript
type FileDiff = {
  file: string
  before: string
  after: string
  additions: number
  deletions: number
}
```

---

## Path

```typescript
type Path = {
  home: string            // v2 only
  state: string           // State directory
  config: string          // Config file path
  worktree: string        // Git worktree
  directory: string       // Current directory
}
```

---

## Config

The full configuration object. See the [OpenCode documentation](https://opencode.ai/docs/config) for complete details.

```typescript
type Config = {
  $schema?: string
  theme?: string

  keybinds?: KeybindsConfig
  logLevel?: LogLevel     // v2 (moved from tui)

  server?: {              // v2
    port?: number
    hostname?: string
    mdns?: boolean
  }

  tui?: {
    scroll_speed?: number
    scroll_acceleration?: number
    diff_style?: "side-by-side" | "inline"
    logLevel?: LogLevel   // v1
  }

  command?: Record<string, CommandConfig>
  watcher?: Record<string, WatcherConfig>
  plugin?: Record<string, PluginConfig>
  snapshot?: SnapshotConfig
  share?: ShareConfig
  autoupdate?: boolean

  disabled_providers?: Array<string>
  enabled_providers?: Array<string>

  model?: string          // Default model (provider/model format)
  small_model?: string    // Small model for lightweight tasks
  default_agent?: string  // v2
  username?: string

  agent?: {
    plan?: AgentConfig
    build?: AgentConfig
    general?: AgentConfig
    explore?: AgentConfig
    title?: AgentConfig
    summary?: AgentConfig
    compaction?: AgentConfig  // v2
  }

  provider?: Record<string, ProviderConfig>
  mcp?: Record<string, McpLocalConfig | McpRemoteConfig>
  formatter?: Record<string, FormatterConfig>
  lsp?: Record<string, LspConfig>

  instructions?: string
  layout?: LayoutConfig
  permission?: PermissionConfig
  tools?: ToolsConfig

  enterprise?: EnterpriseConfig
  compaction?: {          // v2
    auto?: boolean
    prune?: boolean
  }

  experimental?: {
    parallel_tool_calls?: boolean
    no_file_diff?: boolean
    continue_loop_on_deny?: boolean  // v2
  }
}
```

---

## v1 vs v2 Differences

Key differences between SDK v1 and v2:

| Feature | v1 | v2 |
|---------|----|----|
| Session archiving | - | `time.archived` field |
| Agent on AssistantMessage | - | `agent` field |
| Skill permissions | - | `skill` in Agent.permission |
| MCP tools event | - | `EventMcpToolsChanged` |
| Project updates | - | `EventProjectUpdated` |
| Global disposed | - | `EventGlobalDisposed` |
| Part manipulation | - | `PartDeleteData`, `PartUpdateData` |
| Permission API | Session-level | Top-level `/permission` |
| Server config | - | `ServerConfig` type |
| Compaction config | - | `compaction` in Config |
| Model family | - | `family` field |
| Interleaved reasoning | - | `interleaved` capability |
| Subtask command | - | `command` field |
| Path home | - | `home` field |
| API error metadata | - | `metadata` field |
| Request interceptor | - | `onRequest` hook |
