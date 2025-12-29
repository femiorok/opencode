# OpenCode: Technical Debt Analysis

Architectural patterns and implementation choices that create ongoing maintenance burden and contribute to bugs.

---

## Debt Category 1: Session Isolation Model

### Current State
Sessions are fully isolated - each subagent gets its own session with separate:
- Message history
- Context budget
- Token tracking
- Tool execution context

### Problems Created
1. **Plugin hooks don't propagate** - security policies bypassed via subagents
2. **No cross-session visibility** - parent can't observe subagent progress
3. **Silent failures** - subagent errors invisible to parent
4. **Duplicated context** - each session recalculates tools, system prompts

### Debt Location
- `packages/opencode/src/tool/task.ts`
- `packages/opencode/src/session/prompt.ts`
- `packages/opencode/src/session/index.ts`

### Why It Accumulated
Initial design prioritized simplicity - each session is self-contained. This worked for single-agent use but breaks down with subagents.

### Refactoring Direction
Consider "session group" or "project context" that spans parent + children:
- Hooks registered at project level, inherited by all sessions
- Aggregated token tracking across session group
- Error/warning propagation to parent

---

## Debt Category 2: Configuration System Complexity

### Current State
Config loaded from 8+ sources with implicit merge order:
1. `~/.config/opencode/`
2. `OPENCODE_CONFIG` env var
3. All `opencode.jsonc` files walking UP from project
4. All `.opencode/` directories walking UP
5. `~/.opencode/`
6. `OPENCODE_CONFIG_DIR` env var
7. Well-known remote config
8. `OPENCODE_CONFIG_CONTENT` env var

### Problems Created
1. **Unpredictable results** - users can't debug why config isn't applied
2. **Inconsistent merge** - some fields replace, plugins concatenate
3. **No provenance** - no way to see which file set which value
4. **Directory name confusion** - singular vs plural enforcement

### Debt Location
- `packages/opencode/src/config/config.ts` (lines 36-156)
- `packages/opencode/src/global/index.ts`

### Why It Accumulated
Each config source was added incrementally for valid use cases (project, user, CI, etc.) without reconsidering the whole system.

### Refactoring Direction
- Add `--config-debug` flag showing all loaded files and merge order
- Make merge strategy explicit and consistent
- Consider layered config with explicit precedence (`local > project > user > global`)
- Remove or deprecate redundant sources

---

## Debt Category 3: Provider Identity Model

### Current State
Providers are identified by simple string keys in a flat object:
```typescript
config.provider[providerID]  // e.g., "anthropic", "openai"
Auth.set(providerID, credentials)
```

### Problems Created
1. **Can't have multiple instances** - users want 2 OpenRouter accounts
2. **Env var names hardcoded** in models.dev database
3. **Silent credential skip** - no feedback when provider auth fails
4. **SDK caching by hash** - fragile, no invalidation

### Debt Location
- `packages/opencode/src/provider/provider.ts`
- `packages/opencode/src/auth/index.ts`

### Why It Accumulated
Simple key-value mapping worked for initial provider set. External models.dev dependency added another layer of indirection.

### Refactoring Direction
- Consider namespaced IDs (`openai:production`, `openai:staging`)
- Add credential validation with actionable error messages
- Implement SDK cache invalidation on credential change
- Reduce models.dev dependency or cache it better

---

## Debt Category 4: Token Estimation Heuristics

### Current State
```typescript
const CHARS_PER_TOKEN = 4
export function estimate(input: string) {
  return Math.round(input.length / CHARS_PER_TOKEN)
}
```

### Problems Created
1. **Inaccurate for code** - code has lower chars/token than prose
2. **Breaks on non-ASCII** - CJK, emoji have different tokenization
3. **Model-agnostic** - Claude, GPT, Gemini have different tokenizers
4. **Compaction misfires** - triggers too early or too late

### Debt Location
- `packages/opencode/src/util/token.ts`
- `packages/opencode/src/session/compaction.ts`

### Why It Accumulated
Accurate tokenization requires model-specific tokenizers which add dependencies and complexity. The heuristic was "good enough" initially.

### Refactoring Direction
- Per-model calibration factors (e.g., Claude ~3.5, GPT ~4, code ~2.5)
- Optional accurate counting via wasm tokenizer
- Track estimation accuracy and adjust dynamically
- Add buffer margin for safety

---

## Debt Category 5: Error Handling Philosophy

### Current State
Many operations fail silently or continue without feedback:
```typescript
if (!apiKey) continue  // No warning
if (!result) return    // No error
```

### Problems Created
1. **Hard to debug** - users don't know why things aren't working
2. **Assumption masking** - code assumes success without verification
3. **No observability** - can't trace what happened

### Debt Location
- Scattered throughout codebase
- Particularly in `provider.ts`, `config.ts`, `task.ts`

### Why It Accumulated
Early development prioritized "just work" over error reporting. Silent fallbacks felt more user-friendly than error messages.

### Refactoring Direction
- Add verbose/debug mode with detailed logging
- Distinguish between expected skips (debug log) and unexpected failures (warning)
- Return result objects with success/failure + reason
- Consider telemetry for failure patterns

---

## Priority Matrix

| Debt | Bug Frequency | Fix Effort | Risk if Ignored |
|------|---------------|------------|-----------------|
| Session Isolation | High (security gap) | High | Critical - security bypass |
| Config Complexity | Medium | Medium | User confusion, support burden |
| Provider Identity | Medium | Medium | Feature limitation |
| Token Estimation | Medium | Low | Compaction issues |
| Error Handling | High | Low per-fix | Ongoing debug difficulty |

---

## Recommended Order of Attack

### Phase 1: Quick Wins (Low effort, High impact)
1. **Add verbose logging** for config loading and credential discovery
2. **Surface subagent errors** to parent session
3. **Accept plural directory names** alongside singular

### Phase 2: Medium Term
1. **Project-scoped hooks** that propagate to subagents
2. **Config debug command** showing loaded files
3. **Per-model token calibration** factors

### Phase 3: Architectural
1. **Session groups** with shared context
2. **Namespaced provider IDs**
3. **Layered config with explicit precedence**

---

## Metrics to Track

After addressing debt:
- GitHub issues mentioning "config", "not working", "silent"
- Time to debug user-reported issues
- Support burden for provider setup
- Security audit findings for hook bypass
