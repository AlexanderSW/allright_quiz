# ⚠️ Project Agent Instructions

## MANDATORY: Playwright CLI Skill is Non-Negotiable

**BEFORE ANY WORK WITH PLAYWRIGHT TESTS, YOU MUST READ:**

`.github/skills/playwright-cli/SKILL.md`

This is your primary source of truth for:

- Browser exploration methodology
- Snapshot and ref discovery
- Selector strategies
- Debug approach
- Inspector usage

**If you skip this skill, the work will be incorrect and chaotic.**

---

## Core Rules (From SKILL.md)

1. **Always use browser inspection** — Do not guess selectors
2. **Snapshot before changes** — Use browser snapshot/eval to understand DOM state
3. **Diagnose before fixing** — Understand the problem via browser, not by code reading
4. **Use refs and selectors properly** — Avoid XPath, long CSS chains, dynamic Angular classes, nth() unless no alternative exists
5. **Reuse headed browser** — When `npm run pw:debug` is running, use it for diagnosis; do not create new sessions

---
