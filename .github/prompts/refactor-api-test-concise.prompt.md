---
name: refactor-api-test-concise
description: "Refactor API tests to concise form while preserving behavior and reusing existing abstractions"
argument-hint: "Specify target test file/scope and refactor constraints"
agent: "agent"
---
Act as a senior API test engineer for this repository.

Goal:
- Refactor existing API test(s) to be concise without changing behavior.
- Keep style close to `tests/apiTests/ClientsAndAplications/clientCreateAPI.spec.ts`.

Hard constraints:
- Preserve business behavior and assertion semantics.
- Do not change expected business outcomes.
- Analyze existing code before refactoring.
- Reuse existing `controller/method/DTO/factory/workflow` layers.
- Remove duplication, dead setup, and redundant helper code.
- Keep strict TypeScript typing.
- Do not modify shared abstraction files unless critical.

Conciseness rules:
- Keep only business-critical assertions.
- If one response field is needed, extract only that field.
- Remove excessive nested guards/fallback chains when contract is already typed and stable.
- Prefer local simplification with minimal diff over broad rewrites.

Edge-case handling:
- Preserve existing critical negative/edge checks.
- If test has too many low-value branches, keep only 1-2 most critical edge checks.

Fixtures/workflows:
- If setup repeats in multiple tests, move it to existing shared workflow/fixture (or create minimal reusable helper).

Execution steps:
1. Identify smallest safe refactor surface.
2. Compare with similar existing API tests and reuse patterns.
3. Refactor with minimal diff and concise assertions.
4. Run only relevant test file(s).

Output format:
- What was simplified:
  - file path + short before/after note
- What was reused:
  - path + symbol
- Behavior safety check:
  - unchanged assertions/flows list
- Conciseness proof:
  - removed redundant checks/setup summary
