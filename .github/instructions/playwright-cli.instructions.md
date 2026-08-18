---
applyTo: "**/*.spec.ts,**/*.test.ts,**/tests/**/*.ts,**/pages/**/*.ts,**/fixtures/**/*.ts,**/helpers/**/*.ts,**/src/**/*.ts"
---

For Playwright UI tests, selectors, waits, Page Objects, and assertions:

- Read and follow `.github/skills/playwright-cli/SKILL.md`.
- Use a fresh `playwright-cli snapshot` before changing selectors.
- Use `playwright-cli eval` to inspect `data-testid`, `role`, `aria-label`, `id`, `name`, and visible text.
- Do not use screenshots as the main source for selector discovery.
- Do not use old `.playwright-cli` or `.playwright-mcp` snapshot files as current truth.
- Prefer `getByTestId`, `getByRole`, `getByLabel`, `getByText`.
- Avoid XPath, long CSS chains, Angular generated classes, and unnecessary `nth()`.