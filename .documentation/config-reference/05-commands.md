# Commands

Commands are reusable prompt templates that you invoke with a slash prefix (e.g., `/test`, `/review`). They're shortcuts for common tasks.

## `command`

**Type:** `Record<string, CommandConfig>`

```jsonc
{
  "command": {
    "test": {
      "template": "Run the test suite for this project. If any tests fail, analyze the failures and suggest fixes. Focus on the root cause, not just making tests pass.",
      "description": "Run tests and fix failures",
      "agent": "build",
      "model": "anthropic/claude-sonnet-4-5"
    },
    "review": {
      "template": "Review the changes in my current git diff. Look for:\n- Bugs and logic errors\n- Security issues\n- Performance concerns\n- Code style issues\n\nBe specific and actionable.",
      "description": "Review current git changes"
    },
    "component": {
      "template": "Create a new React component named $ARGUMENTS with TypeScript. Include:\n- Proper typing for props\n- Basic tests\n- Storybook story if the project uses Storybook",
      "description": "Create a new React component"
    }
  }
}
```

---

## Command Options

### `template`
**Type:** `string`
**Required:** Yes

The prompt text sent to the AI when this command is invoked.

**Special variables in templates:**
- `$ARGUMENTS`: Replaced with any text after the command. E.g., `/component Button` replaces `$ARGUMENTS` with "Button".

### `description`
**Type:** `string`

Short description shown in the command picker (`ctrl+p` or `/`).

### `agent`
**Type:** `string`

Which agent handles this command. If not set, uses the current agent.

### `model`
**Type:** `string`

Override the model for this command. Useful for commands that need more/less capability.

### `subtask`
**Type:** `boolean`

If `true`, runs the command as a subtask (subagent) rather than in the main conversation.

---

## Defining Commands via Markdown Files

Commands can also be defined as markdown files in:
- `~/.config/opencode/command/` (global)
- `.opencode/command/` (project-specific)

**Example:** `.opencode/command/debug.md`
```markdown
---
description: Debug a failing test
agent: build
---

The following test is failing: $ARGUMENTS

Please:
1. Run the test to see the actual failure
2. Analyze the code being tested
3. Identify the root cause
4. Fix the issue
5. Verify the fix by running the test again
```

---

## Practical Examples

### Git Commit Command
```markdown
---
description: Create a well-formatted git commit
---

Review my staged changes with `git diff --staged` and create a commit with:
- A concise subject line (50 chars max)
- A blank line
- A body explaining what and why (not how)

Follow conventional commits format if the project uses it.
```

### Documentation Command
```markdown
---
description: Generate documentation for a function or module
model: anthropic/claude-sonnet-4-5
---

Document the following code: $ARGUMENTS

Include:
- A brief description of what it does
- Parameter descriptions with types
- Return value description
- Usage examples
- Any important notes or caveats
```

### Refactor Command
```markdown
---
description: Refactor code for better readability
agent: build
---

Refactor this code for improved readability and maintainability: $ARGUMENTS

Focus on:
- Clear variable and function names
- Single responsibility principle
- Reducing complexity
- Adding appropriate comments only where logic isn't self-evident

Don't change functionality or add features.
```
