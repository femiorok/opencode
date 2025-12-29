# OpenCode: Code Quality Issues & Bug-Causing Patterns

Analysis of 300+ GitHub issues and codebase exploration reveals these code quality problems that cause bugs. These are implementation issues, not feature requests.

---

## Issue 1: Silent Failures in Subagent System

**Severity:** High
**Related Issues:** [#5970](https://github.com/sst/opencode/issues/5970)

### Location
`packages/opencode/src/tool/task.ts` (lines 92-133)

### Problem
```typescript
// Task tool spawns isolated session, returns only final output
const result = await SessionPrompt.prompt({
  sessionID: session.id,
  prompt: params.prompt,
  model: agent.model ?? ctx.model,
  tools,
  ...
})
// If subagent hits context limit and compaction fails,
// parent receives truncated/incomplete output with no error indication
```

### Why This Is a Bug
- User sees incomplete results with no indication of failure
- Parent agent continues as if task succeeded
- No retry mechanism or error surfacing
- Subagent context overflow is completely invisible to parent

### Code Pattern Issues
- No try/catch around subagent execution with error propagation
- No validation of subagent completion status
- No propagation of error/warning state to parent session
- Result returned without checking if subagent completed successfully

---

## Issue 2: Plugin Hooks Don't Intercept Subagent Tools (Security Gap)

**Severity:** Critical
**Related Issues:** [#5894](https://github.com/sst/opencode/issues/5894)

### Location
- `packages/opencode/src/session/prompt.ts` (lines 594, 630)
- `packages/opencode/src/tool/task.ts`
- `packages/opencode/src/plugin/index.ts` (lines 55-70)

### Problem
```typescript
// In prompt.ts - hooks fire in session context only
await Plugin.trigger("tool.execute.before", input, output)
// Execute the tool
await Plugin.trigger("tool.execute.after", input, output)

// But in task.ts - subagent runs in NEW isolated session
const session = await Session.create({
  parentID: ctx.sessionID,  // Link exists but hooks don't propagate
  ...
})
// Subagent's tool calls bypass parent's plugin hooks entirely
```

### Why This Is a Bug
- Users install plugins to enforce security policies (block dangerous commands, validate code)
- Any agent can delegate to subagent to bypass these policies
- Security guardrails become ineffective
- Attack vector: prompt agent to use Task tool to circumvent restrictions

### Code Pattern Issues
- Hooks are session-scoped when they should be project-scoped
- No mechanism to inherit hook context to child sessions
- Session isolation breaks security model

---

## Issue 3: Inconsistent Directory Naming (Hardcoded Typo Check)

**Severity:** Medium
**Related Issues:** [#6266](https://github.com/sst/opencode/issues/6266), [#6177](https://github.com/sst/opencode/issues/6177)

### Location
`packages/opencode/src/config/config.ts` (lines 158-173)

### Problem
```typescript
const INVALID_DIRS = new Bun.Glob(
  `{${["agents", "commands", "plugins", "tools", "skills"].join(",")}}/`
)

// Later in validation:
for await (const match of INVALID_DIRS.scan(dir)) {
  throw new ConfigDirectoryTypoError({
    found: match,
    expected: match.slice(0, -2),  // Remove 's/' to get singular
  })
}
```

### Why This Is a Bug
- Claude Code uses `skills/` (plural) - OpenCode rejects it as "typo"
- Error message claims user made a typo when they intentionally used plural
- Forces users to restructure their directories
- Breaks compatibility with Claude Code's conventions

### Code Pattern Issues
- Hardcoded validation list instead of configurable
- No graceful handling of alternate naming conventions
- Assumes singular is "correct" without documentation explaining why
- Error type name (`ConfigDirectoryTypoError`) is misleading

---

## Issue 4: Rough Token Estimation Causes Compaction Misfires

**Severity:** Medium
**Related Issues:** [#6286](https://github.com/sst/opencode/issues/6286)

### Location
`packages/opencode/src/util/token.ts`

### Problem
```typescript
const CHARS_PER_TOKEN = 4

export function estimate(input: string) {
  return Math.round(input.length / CHARS_PER_TOKEN)
}
```

### Why This Is a Bug
- Different models have different tokenizers (Claude vs GPT vs Gemini)
- Code has much lower chars/token ratio than natural language prose
- Non-ASCII text (CJK, emoji) breaks this heuristic completely
- Compaction triggers too early or too late depending on content type
- Users report "compaction fails to run on time" and context balloons

### Code Pattern Issues
- Magic number (4) without per-model calibration
- No fallback to actual tokenizer when available
- Estimation used for critical decisions (when to trigger compaction)
- Same heuristic applied to all content types

---

## Issue 5: Config Merge Produces Unpredictable Results

**Severity:** High
**Related Issues:** [#6156](https://github.com/sst/opencode/issues/6156), [#6171](https://github.com/sst/opencode/issues/6171)

### Location
`packages/opencode/src/config/config.ts` (lines 36-156)

### Problem
```typescript
// Config loaded from 8+ sources with implicit precedence
const sources = [
  // 1. ~/.config/opencode/
  // 2. OPENCODE_CONFIG env var
  // 3. All opencode.jsonc files walking UP from project
  // 4. All .opencode/ directories walking UP
  // 5. ~/.opencode/
  // 6. OPENCODE_CONFIG_DIR env var
  // 7. Well-known remote config
  // 8. OPENCODE_CONFIG_CONTENT env var
]

for (const source of sources) {
  result = mergeDeep(result, source)  // Order matters but isn't visible
}

// Special case: plugins are concatenated, not replaced
if (Array.isArray(target.plugin) && Array.isArray(source.plugin)) {
  target.plugin = [...target.plugin, ...source.plugin]
}
```

### Why This Is a Bug
- Users can't debug why their config isn't being applied
- Project config might be overridden by home config unexpectedly
- No log of which files were loaded or in what order
- Merge strategy differs per field (plugins concat, others replace)
- "opencode doesn't know the location of its config file" - users report model not finding configs

### Code Pattern Issues
- Side effects from implicit file system traversal
- No debugging output showing config provenance
- Inconsistent merge strategies without documentation
- No way to see final merged result

---

## Issue 6: Provider Credentials Silently Ignored

**Severity:** High
**Related Issues:** [#6280](https://github.com/sst/opencode/issues/6280), [#6262](https://github.com/sst/opencode/issues/6262)

### Location
`packages/opencode/src/provider/provider.ts` (lines 676-684)

### Problem
```typescript
for (const [providerID, provider] of Object.entries(database)) {
  const apiKey = provider.env.map((item) => env[item]).find(Boolean)
  if (!apiKey) continue  // <-- Silent skip, user never knows why
  mergeProvider(providerID, {
    source: "env",
    key: provider.env.length === 1 ? apiKey : undefined,
  })
}
```

### Why This Is a Bug
- User sets `GOOGLE_APPLICATION_CREDENTIALS`, provider doesn't appear
- No error, warning, or indication that credential was not found
- User assumes setup failed when actually env var name doesn't match
- Providers like Vertex AI use different auth methods not covered by simple env var check

### Code Pattern Issues
- Silent `continue` instead of warning/debug log
- No validation that expected env vars exist when provider is configured
- No feedback loop to user about credential discovery process
- Different providers have different auth patterns but same silent handling

---

## Issue 7: SDK Instance Caching Causes Stale State

**Severity:** Low-Medium
**Related Issues:** None directly filed, but related to credential refresh issues

### Location
`packages/opencode/src/provider/provider.ts` (line 836)

### Problem
```typescript
const key = Bun.hash.xxHash32(JSON.stringify({ npm: model.api.npm, options }))
const existing = s.sdk.get(key)
if (existing) return existing  // Returns potentially stale SDK
```

### Why This Is a Bug
- If user changes API key mid-session, old SDK with old key still used
- Hash collision (extremely unlikely but possible) could return wrong SDK
- No cache invalidation mechanism when credentials change
- Session restart required to pick up credential changes

### Code Pattern Issues
- Caching based on serialized options is fragile (property order matters for hash)
- No cache TTL or invalidation strategy
- xxHash32 is fast but not designed for this use case (content addressing)
- SDK state tied to session lifecycle without refresh capability

---

## Summary Table

| # | Issue | Location | Severity | Root Cause |
|---|-------|----------|----------|------------|
| 1 | Silent subagent failures | `task.ts:92-133` | High | No error propagation |
| 2 | Plugin hooks bypassed | `prompt.ts`, `task.ts` | Critical | Session-scoped hooks |
| 3 | Directory name rejection | `config.ts:158-173` | Medium | Hardcoded validation |
| 4 | Token estimation inaccuracy | `token.ts` | Medium | Magic number heuristic |
| 5 | Config merge unpredictability | `config.ts:36-156` | High | Implicit merge order |
| 6 | Silent credential skip | `provider.ts:676-684` | High | No feedback on skip |
| 7 | SDK cache staleness | `provider.ts:836` | Low-Medium | No cache invalidation |

---

## Pattern Categories

### Silent Failure Patterns
- Issues 1, 6: Operations fail silently without user feedback
- Anti-pattern: `if (!condition) continue` without logging

### Hardcoded Assumptions
- Issues 3, 4: Magic values and hardcoded lists
- Anti-pattern: Validation logic embedded in code rather than config

### State Management Issues
- Issues 5, 7: Implicit state accumulation and caching
- Anti-pattern: Global state without clear lifecycle

### Security Gaps
- Issue 2: Session isolation breaks security model
- Anti-pattern: Security at wrong abstraction level
