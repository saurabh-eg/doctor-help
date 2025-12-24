---
description: End work session - saves progress to project memory
---

# End Session Workflow

## Steps

1. **Summarize today's work**
   - List all files created/modified
   - Note key decisions made
   - Document any blockers or TODOs

2. **Update PROJECT_MEMORY.md**
   - Add new session entry with date
   - Update current progress section
   - Add any new key decisions

3. **Update task.md status**
   - Mark completed items with [x]
   - Update in-progress items with [/]
   - Add any new discovered tasks

4. **Commit changes (optional)**
   ```bash
   git add .
   git commit -m "Session end: [summary of work]"
   ```

## Format for PROJECT_MEMORY.md Update

```markdown
## Session: [DATE]
### What Was Done
- [List of accomplishments]

### Key Decisions
- [Any important decisions made]

### Next Steps
- [What to work on next]
```
