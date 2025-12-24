---
description: Start a new work session - reads project memory and context
---

# Start Session Workflow

## Steps

1. **Read project memory**
   - Read `PROJECT_MEMORY.md` to understand previous work
   - Read `.agent/workflows/project-context.md` for architecture context

2. **Check current task status**
   - Read the latest `task.md` artifact if exists
   - Understand what's in progress vs completed

3. **Review recent changes**
   ```bash
   git log --oneline -10
   ```

4. **Summarize to user**
   - Tell user what was last worked on
   - Suggest what to continue with

## What to Say
"I've reviewed the project memory. Last session you [summary]. Ready to continue with [next task]?"
