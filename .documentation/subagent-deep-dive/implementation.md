# Subagent Implementation

Code walkthrough with file:line references.

---

## 1. Agent Definitions

**File**: `packages/opencode/src/agent/agent.ts:120-165`

Native subagents:

```typescript
general: {
  name: "general",
  description: `General-purpose agent...`,
  hidden: true,
  tools: {
    todoread: false,
    todowrite: false,
  },
  mode: "subagent",
},

explore: {
  name: "explore",
  description: `Agent for exploring codebases...`,
  prompt: PROMPT_EXPLORE,
  tools: {
    todoread: false,
    todowrite: false,
    edit: false,
    write: false,
  },
  mode: "subagent",
},
```

---

## 2. Task Tool

**File**: `packages/opencode/src/tool/task.ts:14-136`

### Parameters

```typescript
parameters: z.object({
  description: z.string(),
  prompt: z.string(),
  subagent_type: z.string(),
  session_id: z.string().optional(),
}),
```

### Execution Flow

**Session creation** (`task.ts:43-53`):
```typescript
const session = params.session_id
  ? await Session.fromID(params.session_id)
  : await Session.create({
      parentID: ctx.sessionID,
      title: params.description + ` (@${agent.name} subagent)`,
    })
```

**Event subscription** (`task.ts:57-77`):
```typescript
const unsub = Bus.subscribe(MessageV2.Event.PartUpdated, async (evt) => {
  if (evt.properties.part.sessionID !== session.id) return
  if (evt.properties.part.type !== "tool") return
  // Track tool executions in parts{}
})
```

**Tool restrictions** (`task.ts:100-105`):
```typescript
tools: {
  todowrite: false,
  todoread: false,
  task: false,
  ...agent.tools,
}
```

**Result collection** (`task.ts:110-133`):
```typescript
const messages = await Session.messages({ sessionID: session.id })
const summary = messages
  .filter((x) => x.info.role === "assistant")
  .flatMap((msg) => msg.parts.filter((x) => x.type === "tool"))
  .map((part) => ({
    id: part.id,
    tool: part.tool,
    state: { status: part.state.status, title: part.state.title },
  }))

return {
  title: params.description,
  metadata: { summary, sessionId: session.id },
  output: text + `\n\n<task_metadata>\nsession_id: ${session.id}\n</task_metadata>`,
}
```

---

## 3. Session Creation

**File**: `packages/opencode/src/session/index.ts:177-210`

```typescript
async function createNext(input: { parentID?: string; title?: string }) {
  const result: Session.Info = {
    id: Identifier.create("session"),
    projectID: project.id,
    parentID: input.parentID,
    title: input.title ?? `Child session - ${new Date().toISOString()}`,
    time: { created: Date.now(), updated: Date.now() },
  }

  await Storage.write(["session", project.id, result.id], result)

  // Auto-share disabled for child sessions
  if (!result.parentID && cfg.share === "auto") share(result.id)

  Bus.publish(Event.Created, { info: result })
  return result
}
```

---

## 4. Child Session Queries

**File**: `packages/opencode/src/session/index.ts:285-294`

```typescript
export const children = fn(Identifier.schema("session"), async (parentID) => {
  const result = [] as Session.Info[]
  for (const item of await Storage.list(["session", project.id])) {
    const session = await Storage.read<Info>(item)
    if (session.parentID !== parentID) continue
    result.push(session)
  }
  return result
})
```

---

## 5. Plugin Hooks

**File**: `packages/opencode/src/plugin/index.ts:55-70`

Hooks fire for all tool executions. The `sessionID` in hook context is the subagent's session ID, not the parent's:

```typescript
await Plugin.trigger(
  "tool.execute.before",
  {
    tool: item.id,
    sessionID: input.sessionID,  // Subagent's session
    callID: options.toolCallId,
  },
  { args }
)
```

---

## 6. Error Handling

**File**: `packages/opencode/src/session/processor.ts:343-367`

```typescript
catch (e: any) {
  const error = MessageV2.fromError(e, { providerID: input.model.providerID })
  const retry = SessionRetry.retryable(error)

  if (retry !== undefined) {
    attempt++
    const delay = SessionRetry.delay(attempt, error)
    await SessionRetry.sleep(delay, input.abort)
    continue
  }

  input.assistantMessage.error = error
  Bus.publish(Session.Event.Error, {
    sessionID: input.assistantMessage.sessionID,
    error: input.assistantMessage.error,
  })
}
```

---

## 7. Custom Agent Loading

**File**: `packages/opencode/src/agent/agent.ts:199-255`

Agents loaded from:
1. `config.agent` in opencode.json
2. Markdown files in `.opencode/agent/` and `~/.config/opencode/agent/`
3. Native definitions (build, plan, explore, general)

Markdown frontmatter fields:
```yaml
---
description: Agent description
mode: subagent
model: anthropic/claude-sonnet-4-20250514
tools:
  edit: false
---
```
