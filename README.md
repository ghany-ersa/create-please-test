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
- Chrome browser (dikelola otomatis oleh Playwright)

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
```

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
├── playwright.config.js  # Playwright configuration
├── app.js                # Factory function — creates please + components per test
├── package.json
├── .env.example          # Environment variable template
├── .gitignore
│
├── data/
│   └── main.js           # Page URLs and test account data
│
├── components/
│   └── auth.js           # Reusable login/logout actions
│
└── feature/
    └── login.spec.js     # Example login test suite
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
const AuthComponent = require('./components/auth')

function createApp(page) {
    const please = new Please(page)
    return {
        please,
        AUTH: new AuthComponent(please)
    }
}

module.exports = { createApp }
```

Setiap test memanggil `createApp(page)` dengan `page` dari Playwright fixture. Ini memastikan setiap test berjalan terisolasi.

---

### `data/main.js` — Pages and accounts

```js
module.exports = {
    PAGE: {
        login: {
            url: `${baseUrl}/practice-test-login/`,
            title: 'Test Login | Practice Test Automation'
        },
        dashboard: {
            url: `${baseUrl}/logged-in-successfully/`,
            title: 'Logged In Successfully | Practice Test Automation'
        }
    },
    ACCOUNT: {
        valid:         { username: 'student',     password: 'Password123' },
        wrongPassword: { username: 'student',     password: 'wrongpassword' },
        wrongUsername: { username: 'invaliduser', password: 'Password123' },
        empty:         { username: '',            password: '' }
    }
}
```

---

### `components/auth.js` — Reusable actions

```js
class Auth {
    constructor(please) {
        this.please = please
    }

    async login(user) {
        await this.please.fill('input username', '#username', user.username)
        await this.please.fill('input password', '#password', user.password)
        await this.please.click('button submit', '#submit')
    }

    async logout() {
        await this.please.click('button logout', 'text=Log out')
    }
}
```

---

### `feature/login.spec.js` — Example test

```js
const { test } = require('@playwright/test')
const { createApp } = require('../app')
const { PAGE, ACCOUNT } = require('../data/main')

test.describe('Login - practicetestautomation.com', () => {

    test('login berhasil', async ({ page }) => {
        const { please, AUTH } = createApp(page)
        await please.goto(PAGE.login)
        await AUTH.login(ACCOUNT.valid)
        await please.verifyPage(PAGE.dashboard)
        await please.see('teks sukses', 'h1', 'Logged In Successfully')
        await AUTH.logout()
    })

    test('login gagal - username salah', async ({ page }) => {
        const { please, AUTH } = createApp(page)
        await please.goto(PAGE.login)
        await AUTH.login(ACCOUNT.wrongUsername)
        await please.see('pesan error', '#error', 'Your username is invalid!')
    })

})
```

Setiap `test` block mendapat `page` sendiri dari Playwright — tidak ada shared state antar test.

---

## please-test API

| Method | Description |
|--------|-------------|
| `please.goto({ url, title? })` | Navigasi ke URL, opsional verifikasi title |
| `please.verifyPage({ url?, title? })` | Verifikasi URL dan/atau title halaman saat ini |
| `please.click(label, selector, delay?)` | Klik elemen |
| `please.fill(label, selector, value)` | Isi input field |
| `please.see(label, selector, expected?)` | Ambil teks/nilai elemen, opsional assert |
| `please.untilShow(label, selector, timeout?)` | Tunggu elemen muncul |
| `please.screenshot(label?)` | Ambil screenshot |

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

## Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run all spec files |
| `npm run report` | Run tests and open HTML report |

---

## License

MIT © [Myghan](mailto:ghanyersa24@gmail.com)
