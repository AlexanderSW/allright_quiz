# AllRight Quiz — автотести

Проєкт містить contract, UI + API та E2E тести квізу AllRight. Тести написані на TypeScript із використанням Playwright Test.

> **Увага:** частина тестів працює зі stage-середовищем і створює реальних тестових користувачів та бронювання пробних уроків. Не запускайте їх проти production.

## Що потрібно встановити

- [Node.js](https://nodejs.org/) версії `20.19.0` або новішої;
- npm версії `10` або новішої;
- Git;
- Google Chrome — потрібен для інтерактивної діагностики через `playwright-cli`.

Перевірити версії:

```bash 
node --version
npm --version
git --version
```

## Підготовка проєкту

У корені репозиторію виконайте:

```bash
npm ci
npx playwright install
```

`npm ci` встановлює точні версії залежностей із `package-lock.json`, а друга команда завантажує Chromium, Firefox і WebKit для тестів.

Для команд інтерактивної діагностики додатково встановіть Playwright CLI:

```bash
npm install --global @playwright/cli
```

## Файли та змінні середовища

Створіть у корені проєкту файл `.env`:

```dotenv
QUIZ_BASE_URL=https://stage.allright.com
QUIZ_API_BASE_URL=https://stage.allright.com
```

Змінні використовуються так:

- `QUIZ_BASE_URL` — базова адреса вебзастосунку квізу, OAuth і tracking-конфігурації;
- `QUIZ_API_BASE_URL` — базова адреса backend API для користувачів, експериментів і пробних уроків.

Не додавайте `.env` до Git: файл уже внесений до `.gitignore`.

Для повного API-сценарію також потрібен файл `requests_responses/list_of_steps.txt`. Він уже є в репозиторії. У ньому має бути по одному унікальному slug кроку Charlie-квізу на рядок, у фактичному порядку проходження. Оновлюйте цей файл, якщо склад або порядок кроків зміниться.

## Запуск тестів

Усі тести в усіх налаштованих браузерах:

```bash
npx playwright test
```

Швидкий запуск лише в Chromium:

```bash
npx playwright test --project=chromium
```

Запуск за рівнем тестів:

```bash
# API contract-тести
npx playwright test tests/contract --project=chromium

# UI + API тести
npx playwright test tests/ui-api --project=chromium

# Повний E2E-сценарій
npx playwright test tests/e2e --project=chromium
```

Окремий файл або тест:

```bash
npx playwright test tests/contract/quiz-experiment.contract.spec.ts --project=chromium
npx playwright test --grep "Quiz experiment API contract" --project=chromium
```

Конфігурація за замовчуванням запускає браузери у видимому режимі (`headless: false`). Після виконання HTML-звіт зберігається в `playwright-report/`.

Відкрити останній HTML-звіт:

```bash
npx playwright show-report
```

## Інтерактивна діагностика

Перед зміною локаторів або розбором UI-помилки використовуйте наявну headed-сесію та свіжий snapshot:

```bash
npx playwright-cli list
npm run pw:debug
npx playwright-cli goto https://stage.allright.com/uk/app/sign-up/long/personalized/age-range
npx playwright-cli snapshot
```

Якщо сесія вже запущена, повторно `npm run pw:debug` виконувати не потрібно. Для повного очищення артефактів і нової сесії:

```bash
npm run pw:fresh
```

Інші службові команди:

```bash
# Видалити локальні browser-сесії, test-results і playwright-report
npm run pw:clean
```

Детальний процес пошуку локаторів і діагностики описаний у `.github/skills/playwright-cli/SKILL.md`.

## Основна структура

```text
tests/contract/                  API contract-тести
tests/ui-api/                    UI-сценарії з перевіркою результату через API
tests/e2e/                       наскрізні бізнес-сценарії
src/pages/                       Page Objects
src/fixtures/                    Playwright fixtures
src/api/                         API-клієнти та tracking
src/data/                        DTO, фабрики й валідатори тестових даних
src/config/env.ts                читання змінних середовища
requests_responses/list_of_steps.txt  порядок кроків Charlie-квізу
playwright.config.ts             конфігурація Playwright Test
```

