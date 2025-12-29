# Subagent Limitations

Known behaviors and constraints in the subagent system.

---

## Error Propagation

**Location**: `task.ts:92-108`

When a subagent encounters errors (context overflow, API failures), the error handling occurs within the subagent's session. The parent receives whatever partial result was generated. There is no explicit error status in the returned metadata.

**Related issue**: [#5970](https://github.com/sst/opencode/issues/5970)

---

## Plugin Hook Scope

**Location**: `plugin/index.ts:55-70`, `task.ts`

Plugin hooks fire for subagent tool executions, but the `sessionID` in the hook context is the subagent's session ID. Hooks that filter by session ID will not automatically associate subagent calls with the parent session.

```typescript
// Hook receives subagent's sessionID
await Plugin.trigger("tool.execute.before", {
  sessionID: input.sessionID,  // Subagent session, not parent
})
```

**Related issue**: [#5894](https://github.com/sst/opencode/issues/5894)

---

## Progress Visibility

**Location**: `dialog-session-list.tsx:33`

Active subagents are not displayed in the main UI. The parent session shows "thinking" state while the subagent executes. Progress is available via:
- Task tool metadata updates (tool execution list)
- Event subscription via SDK
- Direct navigation to subagent session

**Related issue**: [#5242](https://github.com/sst/opencode/issues/5242)

---

## Hierarchy Depth

**Location**: `task.ts:100-105`

Subagents cannot spawn their own subagents. The `task` tool is disabled for all subagent sessions:

```typescript
tools: {
  task: false,  // Hardcoded
}
```

Maximum depth is 2 levels: primary → subagent.

---

## Context Isolation

**Location**: `session/index.ts:177-210`

Subagents do not inherit the parent's conversation history. Each subagent receives:
- Its agent-specific system prompt
- Project instructions (opencode.md)
- The task prompt from the parent

The subagent has no access to:
- Parent's previous messages
- Parent's todo list
- Other subagents' contexts

---

## Result Content

**Location**: `task.ts:110-133`

The Task tool returns to the parent:
- Final text response from subagent
- List of tool executions (tool name, status, title)
- Subagent session ID

Not returned:
- Full tool outputs (file contents, grep results)
- Intermediate reasoning
- Complete message history

---

## Session Resume Validation

**Location**: `task.ts:43-48`

When resuming a session via `session_id`, no validation occurs to check that the session's original agent type matches the requested `subagent_type`.

---

## Auto-Share Behavior

**Location**: `session/index.ts:196`

Auto-sharing is disabled for child sessions:

```typescript
if (!result.parentID && cfg.share === "auto") share(result.id)
```

Only top-level sessions are auto-shared.

---

## Related Documentation

- [Code Quality Issues](../code-quality-issues.md)
- [Technical Debt](../technical-debt.md)
- [FAQ: Subagents](../faq/subagents.md)
