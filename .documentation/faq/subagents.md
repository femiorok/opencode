# Subagent Behavior & Visibility

## Why don't subagent sessions appear in the sidebar?

**By design.** Subagent sessions are filtered from the session list to reduce clutter.

The filter in `dialog-session-list.tsx`:
```typescript
.filter((x) => x.parentID === undefined)
```

Only top-level (parent) sessions appear in the sidebar. Subagent sessions have a `parentID` linking them to their parent session.

**To access subagent sessions:**
1. Check the parent session's task tool output for summaries
2. Use the subagent dialog if available
3. Navigate directly via session ID in the URL

---

## Why did my subagent silently fail?

Subagents can fail silently when they hit **context window limits**. The parent agent may not receive clear error information.

**Common causes:**
1. Open-ended research tasks that accumulate too much context
2. Large file reads within subagent scope
3. Tool outputs that exceed token limits

**Workarounds:**
1. Break large research tasks into smaller, focused subtasks
2. Use specific queries rather than open-ended exploration
3. Monitor the subagent's progress if possible

**Known issue:** Error messages from model providers during subagent execution don't always propagate back to the primary agent. See [GitHub issue #5204](https://github.com/sst/opencode/issues/5204).

---

## Can I change the model used by subagents?

Yes. Configure each subagent's model in your config:

```json
{
  "agent": {
    "explore": {
      "model": "anthropic/claude-3-haiku-20240307"
    },
    "general": {
      "model": "mistral/mistral-large-latest"
    }
  }
}
```

This works for all agents, including built-in subagents like `explore` and `general`.

---

## How are subagent sessions created?

When a primary agent calls the **Task tool**, it creates a child session:

```typescript
return await Session.create({
  parentID: ctx.sessionID,  // Links to parent
  title: params.description + ` (@${agent.name} subagent)`,
})
```

**Session hierarchy:**
- Parent session has `parentID: undefined`
- Child session has `parentID: "<parent-session-id>"`
- Child sessions can be retrieved via `Session.children(parentID)`

---

## What tools do subagents have access to?

Subagents have **restricted tool access** compared to primary agents:

| Tool | Primary Agent | Subagent |
|------|---------------|----------|
| `bash` | Yes | Yes |
| `edit` | Yes | Yes |
| `read` | Yes | Yes |
| `glob` | Yes | Yes |
| `grep` | Yes | Yes |
| `todowrite` | Yes | **No** |
| `todoread` | Yes | **No** |
| `task` | Yes | **No** (can't spawn sub-subagents) |

This prevents infinite subagent spawning and maintains clear task boundaries.

---

## Do plugin hooks intercept subagent tool calls?

**Yes.** Plugin hooks fire for all tool executions, including those in subagent sessions.

```typescript
await Plugin.trigger(
  "tool.execute.before",
  {
    tool: item.id,
    sessionID: input.sessionID,  // Subagent's session ID
    callID: options.toolCallId,
  },
  { args }
)
```

**Key points:**
- Hooks receive the **subagent's sessionID**, not the parent's
- To distinguish parent vs child tool calls, check the sessionID
- All tool calls trigger hooks regardless of session type

**Security note:** If you're using hooks for security policies, they apply uniformly. However, some users have reported cases where subagents use bash commands (which bypass tool-specific restrictions). See [GitHub issue #5894](https://github.com/sst/opencode/issues/5894).

---

## How do I track subagent activity?

### Via Events

Subscribe to events and filter by sessionID:

```typescript
const stream = await client.event.subscribe()

for await (const event of stream.stream!) {
  if (event.type === "message.part.updated") {
    const { part } = event.properties
    if (part.type === "tool") {
      console.log(`Tool ${part.tool} in session ${part.sessionID}`)
    }
  }
}
```

### Via Parent Session

The Task tool aggregates subagent results back to the parent:

```typescript
metadata: {
  summary: [...],       // Tool execution summaries
  sessionId: session.id // Subagent session ID
}
```

---

## Why is there no indicator for active subagents?

This is a known UX limitation. Active subagents run in background sessions without a dedicated status indicator in the main UI.

**Current workarounds:**
1. Watch the Task tool output in the parent session
2. Monitor via event subscription
3. Check session status via API: `client.session.status()`

**Feature request:** See [GitHub issue #5242](https://github.com/sst/opencode/issues/5242) for a dedicated subagents sidebar.

---

## Can subagents access the parent session's context?

**No.** Subagents run in isolated sessions with their own context. They receive:
- The task prompt from the parent
- Their own tool access
- Fresh context window

They do **not** inherit:
- Parent session's conversation history
- Parent's todo list
- Parent's file edits (until committed)

This isolation is intentional to prevent context pollution and enable parallel execution.
