const { test } = require('@playwright/test')
const { createApp } = require('../app')
const { ACCOUNT } = require('../data/main')

test.describe('Login - practicetestautomation.com', () => {

    test('menampilkan halaman login', async ({ page }) => {
        const { AUTH } = createApp(page, test)
        await AUTH.goto()
    })

    test('login gagal - username salah', async ({ page }) => {
        const { AUTH } = createApp(page, test)
        await AUTH.goto()
        await AUTH.login(ACCOUNT.wrongUsername)
        await AUTH.seeError('Your username is invalid!')
    })

    test('login gagal - password salah', async ({ page }) => {
        const { AUTH } = createApp(page, test)
        await AUTH.goto()
        await AUTH.login(ACCOUNT.wrongPassword)
        await AUTH.seeError('Your password is invalid!')
    })

    test('login gagal - form kosong', async ({ page }) => {
        const { AUTH } = createApp(page, test)
        await AUTH.goto()
        await AUTH.login(ACCOUNT.empty)
        await AUTH.seeError('Your username is invalid!')
    })

    test('login berhasil', async ({ page }) => {
        const { AUTH } = createApp(page, test)
        await AUTH.goto()
        await AUTH.login(ACCOUNT.valid)
        await AUTH.seeDashboard()
        await AUTH.logout()
    })

})
