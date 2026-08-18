---
name: playwright-cli
description: Use this skill for Playwright UI test debugging, selector discovery, browser exploration, and test generation.
---

# Playwright CLI Skill for this project

## Mandatory workflow

Before changing Playwright tests, Page Objects, selectors, waits, or assertions:

1. Check existing browser session:

```bash
npx playwright-cli list
```

2. If no headed browser is open, start it:

```bash
npm run pw:debug
```

3. Navigate to the needed page using the existing session:

```bash
npx playwright-cli goto <url>
```

4. Take a fresh snapshot:

```bash
npx playwright-cli snapshot
```

5. Use snapshot refs and eval before writing selectors:

```bash
npx playwright-cli eval "el => el.getAttribute('data-testid')" e1
npx playwright-cli eval "el => el.getAttribute('aria-label')" e1
npx playwright-cli eval "el => el.textContent" e1
npx playwright-cli eval "el => el.id" e1
```

## Selector rules

Prefer selectors in this order:

- getByTestId
- getByRole
- getByLabel
- getByText
- stable CSS attributes

Avoid:

- XPath
- long CSS chains
- Angular generated classes
- nth() unless there is no stable alternative
- guessing selectors from screenshots
- using old snapshots from .playwright-cli or .playwright-mcp

## Debugging rules

Do not edit selectors until a fresh snapshot was taken.
Do not use screenshots as the primary source for selector discovery.
Do not run the whole test suite first.
Run only the relevant test file or test title.
Diagnose root cause before changing code.
If a selector fails, inspect the element again with snapshot/eval.
Always use Playwright CLI commands, not Playwright test runner CLI commands, for page inspection.
