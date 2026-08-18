# Copilot Instructions

This is an Angular 21 + TypeScript + Playwright automation project.

## Mandatory Playwright workflow

Before creating, fixing, or debugging Playwright UI tests, selectors, Page Objects, waits, or assertions:

1. Read and follow `.github/skills/playwright-cli/SKILL.md`.
2. Reuse the existing headed `playwright-cli` browser session when available.
3. Do not open a new browser unless no session exists or the current session is broken.
4. Always inspect the current page with a fresh `playwright-cli snapshot`.
5. Use `playwright-cli eval` to inspect element attributes before writing selectors.
6. Do not guess selectors from screenshots, old snapshots, or visual layout.

## Browser session

Use this command to start the debug browser:

```bash
npm run pw:debug
```

Then use:

```bash
playwright-cli list
playwright-cli goto <url>
playwright-cli snapshot
```

## Selector policy

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
- nth() unless no stable selector exists

## Test execution policy

Do not run the full test suite for a local selector/debug issue.
Run only the specific test file or test to speed up the debug cycle:

```bash
npx playwright test path/to/test.spec.ts --project=chromium --headed
```
or with a specific test name:

```bash
npx playwright test -g "exact test title" --project=chromium --headed
```

## Project rules

- Use strict TypeScript typing.
- Follow existing Page Object structure.
- Keep tests deterministic and isolated.
- Use API setup only when it improves speed/stability and does not skip the business-critical UI behavior.
- Use storageState for authenticated flows unless login itself is under test.
- Do not add waitForTimeout except for temporary debugging.
