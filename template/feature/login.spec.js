const { test } = require('@playwright/test')
const { createApp } = require('../app')
const { PAGE } = require('../data/main')

test.describe('Login - practicetestautomation.com', () => {

    test('menampilkan halaman login', async ({ page }) => {
        const { please } = createApp(page, test)
        await please.goto(PAGE.login)
        await please.see('judul halaman', 'h2', 'Test login')
    })

    test('login gagal - username salah', async ({ page }) => {
        const { please } = createApp(page, test)
        await please.goto(PAGE.login)
        await please.fill('input username', '#username', 'wronguser')
        await please.fill('input password', '#password', 'Password123')
        await please.click('button submit', '#submit')
        await please.see('pesan error', '#error', 'Your username is invalid!')
    })

    test('login gagal - password salah', async ({ page }) => {
        const { please } = createApp(page, test)
        await please.goto(PAGE.login)
        await please.fill('input username', '#username', 'student')
        await please.fill('input password', '#password', 'wrongpass')
        await please.click('button submit', '#submit')
        await please.see('pesan error', '#error', 'Your password is invalid!')
    })

    test('login gagal - form kosong', async ({ page }) => {
        const { please } = createApp(page, test)
        await please.goto(PAGE.login)
        await please.click('button submit', '#submit')
        await please.see('pesan error', '#error', 'Your username is invalid!')
    })

    test('login berhasil', async ({ page }) => {
        const { please } = createApp(page, test)
        await please.goto(PAGE.login)
        await please.fill('input username', '#username', 'student')
        await please.fill('input password', '#password', 'Password123')
        await please.click('button submit', '#submit')
        await please.verifyPage(PAGE.dashboard)
        await please.see('teks sukses', 'h1', 'Logged In Successfully')
        await please.click('button logout', 'text=Log out')
    })
})