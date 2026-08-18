---
name: create-concise-api-test
description: "Create a concise API test with strict reuse of existing layers and minimal assertions"
argument-hint: "Describe API scenario, expected behavior, and critical edge cases"
agent: "agent"
---
Act as a senior API test engineer for this repository.

Goal:
- Create a concise, deterministic API test similar in style to `tests/apiTests/ClientsAndAplications/clientCreateAPI.spec.ts`.
- Use the user-provided argument as target scenario.

Mandatory workflow:
1. Analyze existing code before writing anything and list reusable artifacts from:
- `src/api/apiController/**`
- `src/api/apiMethods/**`
- `src/data/dto/**`
- `src/data/factories/**`
- `tests/utils/workflows/**`
- `tests/utils/schemas/**`
2. Reuse existing `controller/method/DTO/factory/workflow` layers whenever available.
3. Do not duplicate logic.
4. If a layer is missing, create only minimal required artifacts.

Conciseness rules:
- No over-abstraction, dead setup, or duplicate parsing/checking.
- If you need one value from response, extract only that value.
- Avoid deep fallback chains and multi-level defensive checks unless endpoint behavior requires it.
- Prefer typed access over `(as any)` where possible.

Assertions policy:
- Assert only business-critical outcomes.
- Keep assertions focused and concise (typically 3-5 key checks per scenario step).
- Separate behavior checks from structure checks:
- behavior tests should verify business fields/outcomes
- schema validation should be in dedicated AJV-focused tests

Edge-case policy:
- Add happy path plus only 1-2 critical edge/negative cases (for example: invalid auth, duplicate entity, invalid required field, not found).
- Do not add speculative branches.

Fixtures/workflows:
- If setup repeats in 2+ tests, use or create shared fixture/workflow helper.
- Reuse existing auth/client/loan/payment workflows before creating new setup code.

Implementation constraints:
- Follow project naming/style used in `tests/apiTests/**` and `src/api/**`.
- Keep strict TypeScript typing.
- Do not modify shared abstraction files unless critical.

Execution plan:
1. Find the closest existing API tests and supporting API layers.
2. Explicitly list what can be reused as-is.
3. Implement only missing minimal pieces.
4. Add or update the target test with concise deterministic assertions.
5. Run only relevant test file(s), not the full suite.

Output format:
- Reused artifacts:
  - path + symbol
- Newly created/updated artifacts:
  - path + short reason
- Final test behavior summary:
  - request, expected response, key assertions
- Conciseness summary:
  - what redundant code/checks were avoided
