# Instructions

## `instructions`

**Type:** `string[]`

Additional instruction files to include in the AI's system context. These files are read and included at the start of every conversation, giving the AI project-specific knowledge.

```json
{
  "instructions": [
    "CONTRIBUTING.md",
    "docs/architecture.md",
    "docs/coding-standards.md",
    ".cursor/rules/*.md"
  ]
}
```

---

## Supported Patterns

**Direct file paths:**
```json
{
  "instructions": ["CONTRIBUTING.md"]
}
```

**Relative paths:**
```json
{
  "instructions": ["docs/guidelines.md"]
}
```

**Glob patterns:**
```json
{
  "instructions": [
    ".cursor/rules/*.md",
    "docs/**/*.md"
  ]
}
```

---

## What to Include

**Good candidates:**
- Coding standards and style guides
- Architecture documentation
- Project-specific conventions
- API documentation for internal libraries
- Team preferences and practices
- Build/test instructions

**Example structure:**
```json
{
  "instructions": [
    "CONTRIBUTING.md",
    "docs/architecture.md",
    "docs/api-guidelines.md",
    ".cursor/rules/typescript.md",
    ".cursor/rules/testing.md"
  ]
}
```

---

## What NOT to Include

**Avoid:**
- Large files (they consume context window space)
- Frequently changing files (causes inconsistent behavior)
- Sensitive information (API keys, passwords, internal URLs)
- Generated files (they may not be up to date)
- Entire codebases (use specific documentation instead)

---

## How Instructions Work

1. When a session starts, instruction files are read
2. Their contents are included in the AI's system prompt
3. The AI uses this information to guide its responses
4. Instructions persist for the entire session

---

## File Size Considerations

Instructions consume tokens from your context window. Keep total instruction size reasonable:

- **Small** (< 1000 tokens): No impact
- **Medium** (1000-5000 tokens): Minor context reduction
- **Large** (> 5000 tokens): Consider splitting or summarizing

Check file sizes:
```bash
wc -w docs/architecture.md
```

Rough estimate: ~0.75 tokens per word.

---

## Practical Examples

### Project with Coding Standards

```json
{
  "instructions": [
    "docs/coding-standards.md",
    "docs/testing-guidelines.md"
  ]
}
```

### Monorepo with Multiple Packages

```json
{
  "instructions": [
    "CONTRIBUTING.md",
    "packages/*/README.md"
  ]
}
```

### Project Using Cursor Rules

```json
{
  "instructions": [
    ".cursor/rules/*.md",
    ".cursorrules"
  ]
}
```

### API Project

```json
{
  "instructions": [
    "docs/api-design.md",
    "docs/error-handling.md",
    "docs/authentication.md"
  ]
}
```
