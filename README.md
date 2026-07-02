# create-please-test

> Scaffold a Playwright-based automation test project in seconds.

> **Note:** This is a project scaffolding tool, not a library. Do not use `npm install create-please-test`.

```bash
npm create please-test@latest my-project
```

The built-in template is pre-configured against **[practicetestautomation.com/practice-test-login](https://practicetestautomation.com/practice-test-login/)** — runs out of the box with no extra setup.

---

## What it does

`create-please-test` generates a ready-to-run E2E test project using:

- **[please-test](https://www.npmjs.com/package/please-test)** — a readable Playwright wrapper
- **[@playwright/test](https://playwright.dev/)** — browser automation and test runner

---

## Requirements

- Node.js >= 18
- Browser binary managed by Playwright (`npx playwright install <browser>`)

---

## Quick Start

```bash
# 1. Scaffold the project
npm create please-test my-project

# 2. Enter the directory
cd my-project

# 3. Install dependencies
npm install

# 4. Install Playwright browsers
npx playwright install chromium

# 5. Copy the environment file
cp .env.example .env
```

`.env` is pre-filled with the default credentials for the practice site:

```env
BASE_URL=https://practicetestautomation.com
ACCOUNT_USERNAME=student
ACCOUNT_PASSWORD=Password123
HEADLESS=true
BROWSER=chromium
```

- `HEADLESS` — `false` to run with a visible browser window
- `BROWSER` — `chromium`, `firefox`, or `webkit` (see `playwright.config.js`)

```bash
# 6. Run the tests
npm test

# (Optional) Open the HTML report
npm run report
```

---

## Generated Project Structure

```
my-project/
├── playwright.config.js         # Playwright configuration
├── app.js                       # Factory function — creates please + components per test
├── package.json
├── jsconfig.json                # Editor IntelliSense config
├── .env.example                 # Environment variable template
├── .gitignore
│
├── data/
│   └── main.js                  # Page URLs and test account data (reads from .env)
│
├── components/
│   └── auth.js                  # Reusable login/logout/assertion actions
│
├── feature/
│   ├── login.spec.js            # Example login test suite (uses `please` directly)
│   └── login-using-component.spec.js  # Same suite rewritten with `AUTH` component (skipped by default)
│
├── reporter/
│   └── please-reporter.js       # Custom Playwright reporter — builds the HTML report
│
└── scripts/
    └── open-report.js           # Local static server for `npm run report`
```

---

## Template Tests: Login

The template includes **5 login scenarios** against `practicetestautomation.com`:

| # | Scenario | Expected |
|---|----------|----------|
| 1 | Open login page | Page loads |
| 2 | Login with wrong username | Error: `Your username is invalid!` |
| 3 | Login with wrong password | Error: `Your password is invalid!` |
| 4 | Login with empty form | Error: `Your username is invalid!` |
| 5 | Successful login | Redirect to `/logged-in-successfully/`, heading `Logged In Successfully` visible |

---

## How It Works

### `app.js` — Per-test factory

```js
const Please = require('please-test')
const Auth = require('./components/auth')

function createApp(page, test) {
    const please = new Please(page, test)
    return {
        please,
        AUTH: Auth(please)
    }
}

module.exports = { createApp }
```

Setiap test memanggil `createApp(page, test)` dengan `page` dan `test` dari Playwright fixture. Parameter `test` memungkinkan `please-test` melaporkan langkah-langkah sebagai `test.step` di HTML report. Ini memastikan setiap test berjalan terisolasi.

---

### `data/main.js` — Pages and accounts

Values are read from `.env` via `dotenv`, so credentials never live in the source code.

```js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

module.exports = {
    PAGE: {
        login: {
            url: `${process.env.BASE_URL}/practice-test-login/`,
            title: 'Test Login | Practice Test Automation',
        },
        dashboard: {
            url: `${process.env.BASE_URL}/logged-in-successfully/`,
            title: 'Logged In Successfully | Practice Test Automation',
        },
    },
    ACCOUNT: {
        valid:         { username: process.env.ACCOUNT_USERNAME, password: process.env.ACCOUNT_PASSWORD },
        wrongPassword: { username: process.env.ACCOUNT_USERNAME, password: 'wrongpassword' },
        wrongUsername: { username: 'invaliduser',                password: process.env.ACCOUNT_PASSWORD },
        empty:         { username: '',                           password: '' },
    },
}
```

---

### `components/auth.js` — Reusable actions

```js
const { PAGE } = require('../data/main')

function Auth(please) {
    return {
        async goto() {
            await please.goto(PAGE.login.url, PAGE.login.title)
        },

        async login(user) {
            await please.fill('input username', '#username', user.username)
            await please.fill('input password', '#password', user.password)
            await please.click('button submit', '#submit')
        },

        async logout() {
            await please.click('button logout', 'text=Log out')
        },

        async seeError(expected) {
            return please.see('pesan error', '#error', expected)
        },

        async seeDashboard() {
            await please.verifyPage(PAGE.dashboard.url, PAGE.dashboard.title)
            return please.see('teks sukses', 'h1', 'Logged In Successfully')
        }
    }
}

module.exports = Auth
```

---

### `feature/login.spec.js` — Example test (uses `please` directly)

```js
const { test } = require('@playwright/test')
const { createApp } = require('../app')
const { PAGE } = require('../data/main')

test.describe('Login', () => {

    test('login berhasil', async ({ page }) => {
        const { please } = createApp(page, test)
        await please.goto(PAGE.login.url, PAGE.login.title)
        await please.fill('input username', '#username', 'student')
        await please.fill('input password', '#password', 'Password123')
        await please.click('button submit', '#submit')
        await please.verifyPage(PAGE.dashboard.url, PAGE.dashboard.title)
        await please.see('teks sukses', 'h1', 'Logged In Successfully')
        await please.click('button logout', 'text=Log out')
    })

    test('login gagal - username salah', async ({ page }) => {
        const { please } = createApp(page, test)
        await please.goto(PAGE.login.url, PAGE.login.title)
        await please.fill('input username', '#username', 'wronguser')
        await please.fill('input password', '#password', 'Password123')
        await please.click('button submit', '#submit')
        await please.see('pesan error', '#error', 'Your username is invalid!')
    })

})
```

Setiap `test` block mendapat `page` sendiri dari Playwright — tidak ada shared state antar test.

### `feature/login-using-component.spec.js` — Same suite via `AUTH` component

The same scenarios rewritten using `components/auth.js` instead of calling `please` directly. This file is `test.describe.skip` by default — flip it to `test.describe` (and skip/remove the other spec) once you migrate to the component pattern.

```js
const { test } = require('@playwright/test')
const { createApp } = require('../app')
const { ACCOUNT } = require('../data/main')

test.describe.skip('Login - using component', () => {

    test('login berhasil', async ({ page }) => {
        const { AUTH } = createApp(page, test)
        await AUTH.goto()
        await AUTH.login(ACCOUNT.valid)
        await AUTH.seeDashboard()
        await AUTH.logout()
    })

    test('login gagal - username salah', async ({ page }) => {
        const { AUTH } = createApp(page, test)
        await AUTH.goto()
        await AUTH.login(ACCOUNT.wrongUsername)
        await AUTH.seeError('Your username is invalid!')
    })

})
```

---

## please-test API

| Method | Description |
|--------|-------------|
| `please.goto(url, title?)` | Navigasi ke URL, opsional verifikasi title |
| `please.verifyPage(url, title?)` | Verifikasi URL dan/atau title halaman saat ini |
| `please.url()` | Ambil URL halaman saat ini |
| `please.title()` | Ambil title halaman saat ini |
| `please.click(label, selector, delay?)` | Klik elemen |
| `please.fill(label, selector, value)` | Isi input field |
| `please.fillAndEnter(label, selector, value)` | Isi input field lalu tekan Enter |
| `please.clear(label, selector)` | Kosongkan input field |
| `please.scrollTo(label, selector)` | Scroll halaman ke posisi elemen |
| `please.uploadFile(label, selector, filePath)` | Upload file ke input type=file |
| `please.datepicker(label, selector, value)` | Isi date picker dengan format tanggal |
| `please.see(label, selector, expected?, timeout?)` | Ambil teks/nilai elemen, opsional assert |
| `please.untilShow(label, selector, timeout?)` | Tunggu elemen muncul (default 20 detik) |
| `please.wait(ms?)` | Pause eksekusi selama N milidetik |
| `please.screenshot(label?)` | Ambil screenshot, simpan ke folder `screenshots/` |
| `please.detectLocator(selector)` | Deteksi tipe selector (id/class/text/role/xpath/dll) |
| `please.toLocator(selector)` | Konversi selector menjadi Playwright `Locator` |

### Selector yang didukung

```
#id          → CSS id
.class       → CSS class
button=Name  → role=button[name=Name] (shorthand ARIA)
text=...     → teks konten
label=...    → form label
role=...     → ARIA role
//xpath      → XPath
```

---

## Adding a New Feature Test

1. **Add URLs/data** in `data/main.js`
2. **Create a component** in `components/` (e.g. `components/checkout.js`)
3. **Write the spec** in `feature/checkout.spec.js`

Playwright otomatis menemukan semua file `*.spec.js` di folder `feature/`.

---

## HTML Report

`reporter/please-reporter.js` is a custom Playwright reporter (registered in `playwright.config.js`) that collects every suite/test/step result and writes a self-contained HTML report to `please-report/index.html` after each run.

`npm run report` runs `scripts/open-report.js`, which serves that `please-report/` folder on `http://localhost:9323` and opens it in your default browser. It errors out if you haven't run `npm test` yet (no report to serve).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run all spec files, generate the HTML report |
| `npm run report` | Serve and open the last HTML report in your browser |

---

## License

MIT © [Myghan](mailto:ghanyersa24@gmail.com)
