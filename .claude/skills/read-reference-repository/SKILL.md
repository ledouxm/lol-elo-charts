---
name: read-reference-repository
description: Reads and compares a cloned repository under `.references` for patterns, conventions, or implementation details. Use when inspecting a local reference repo, comparing layouts, or summarizing the repo's AGENTS.md and key files.
---

# Read Reference Repository

## Quick Start

Start by finding the requested repo under `.references/<name>`, then read its `AGENTS.md` first if it exists.

Check the workspace root `reference-repos.md` file first when you need the curated list of reference clones and the reason each one was added.

Use the reference repo for pattern matching, comparison, and implementation examples. Prefer local file reads over web fetches when the repo is already cloned.

## Workflow

1. Identify the reference repo name and root path under `.references/`.
2. Read `AGENTS.md` first, then inspect the smallest set of relevant files.
3. Use targeted searches to find conventions, module boundaries, and reusable code.
4. Summarize the useful patterns with exact file references.
5. If the repo is missing, ask the user to add it with `add-reference-repository` or create it first.

## Notes

- Treat the reference repo as read-only unless the user explicitly asks to update it.
- When comparing multiple reference repos, call out the shared conventions and the places where they differ.
- Prefer concise, file-backed findings over broad summaries.
- Keep `reference-repos.md` in sync with any new or removed reference clones.
