# Subagent Architecture

Data structures, session model, and relationships in the subagent system.

---

## Agent Schema

**File**: `packages/opencode/src/agent/agent.ts:19-52`

```typescript
export const Info = z.object({
  name: z.string(),
  description: z.string().optional(),
  mode: z.enum(["subagent", "primary", "all"]),
  model: z.string().optional(),
  prompt: z.string().optional(),
  tools: z.record(z.boolean()).optional(),
  permission: Permission.schema.optional(),
  hidden: z.boolean().optional(),
})
```

**Mode values**:
- `"primary"` - User-facing, visible in picker, can be default
- `"subagent"` - Only spawnable via Task tool, hidden from UI
- `"all"` - Can act as either

---

## Session Schema

**File**: `packages/opencode/src/session/index.ts:38-77`

```typescript
export const Info = z.object({
  id: Identifier.schema("session"),
  projectID: z.string(),
  parentID: Identifier.schema("session").optional(),
  version: z.number(),
  title: z.string(),
  time: Time.Info,
})
```

The `parentID` field links child sessions to parents:
- `undefined` = top-level session
- `"session_xxxxx"` = child session

---

## Session Hierarchy

```
Storage: ~/.local/share/opencode/storage/session/{projectID}/

session_abc123.json     { parentID: undefined }      ← Parent
session_def456.json     { parentID: "session_abc123" }  ← Child
session_ghi789.json     { parentID: "session_abc123" }  ← Child
```

---

## Tool Access

```
                    │ build │ plan  │ explore │ general │
────────────────────┼───────┼───────┼─────────┼─────────┤
bash                │   ✓   │   ✓   │    ✓    │    ✓    │
edit                │   ✓   │   ✗   │    ✗    │    ✓    │
write               │   ✓   │   ✗   │    ✗    │    ✓    │
read                │   ✓   │   ✓   │    ✓    │    ✓    │
glob                │   ✓   │   ✓   │    ✓    │    ✓    │
grep                │   ✓   │   ✓   │    ✓    │    ✓    │
────────────────────┼───────┼───────┼─────────┼─────────┤
todoread            │   ✓   │   ✓   │    ✗    │    ✗    │
todowrite           │   ✓   │   ✓   │    ✗    │    ✗    │
task                │   ✓   │   ✓   │    ✗    │    ✗    │
```

The `task`, `todoread`, and `todowrite` tools are always disabled for subagents (`task.ts:100-105`).

---

## Event System

**Defined in** `session/index.ts:89-122`:

```typescript
export const Event = {
  Created: BusEvent.define("session.created", z.object({ info: Info })),
  Updated: BusEvent.define("session.updated", z.object({ info: Info })),
  Deleted: BusEvent.define("session.deleted", z.object({ info: Info })),
  Error: BusEvent.define("session.error", z.object({
    sessionID: z.string().optional(),
    error: MessageV2.Assistant.shape.error,
  })),
}
```

All sessions (parent and child) publish events to the same bus. The Task tool subscribes to `MessageV2.Event.PartUpdated` to track subagent tool execution.

---

## UI Filtering

**File**: `dialog-session-list.tsx:33`

```typescript
.filter((x) => x.parentID === undefined)
```

Sessions with a `parentID` are excluded from the sidebar. When viewing a subagent session directly, the header displays navigation keybinds for parent/sibling sessions (`header.tsx:79-96`).

---

## Cascading Deletion

**File**: `session/index.ts:299-307`

When a parent session is deleted, `Session.remove()` recursively deletes all children first:

```typescript
export const remove = fn(Identifier.schema("session"), async (id) => {
  for (const child of await children(id)) {
    await remove(child.id)
  }
  await Storage.delete(["session", Instance.project.id, id])
})
```
