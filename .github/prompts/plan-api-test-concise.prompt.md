---
name: plan-api-test-concise
description: "Plan concise API tests with reuse-first approach for controllers, methods, DTOs, factories, fixtures, and schemas"
argument-hint: "Describe endpoint/feature and expected behavior"
agent: "agent"
---
Act as a senior API test engineer for this repository.

Prepare a compact implementation-ready API test plan.

Planning rules:
- Start with repository analysis and reuse-first strategy.
- Prioritize existing `apiController/apiMethods/dto/factories/workflows/schemas`.
- Propose minimal additions only if gaps exist.
- Keep coverage hybrid: happy path plus 1-2 critical edge/negative cases.
- Avoid over-testing and speculative branches.

Plan sections (required):
1. Scenario summary:
- endpoint/action
- expected business result

2. Reuse map:
- existing controller/method/DTO/factory/workflow/schema candidates
- exact file paths + symbols

3. Test matrix (concise):
- happy path
- edge/negative case 1
- edge/negative case 2 (optional)

4. Assertions strategy:
- business-critical assertions only
- fields to extract directly (no deep multi-level checks)
- schema validation scope (if needed)

5. Data/setup strategy:
- fixtures/workflows to reuse
- cleanup strategy
- what should be shared if repeated

6. Minimal implementation delta:
- files to create/update
- short reason per file

Output style:
- concise, actionable bullets
- no code unless strictly needed
