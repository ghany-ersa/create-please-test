const { PAGE } = require('../data/main')

/** @param {import('please-test').default} please */
function Auth(please) {
    return {
        async goto() {
            await please.goto(PAGE.login.url, PAGE.login.title)
        },

        /** @param {{ username: string, password: string }} user */
        async login(user) {
            await please.fill('input username', '#username', user.username)
            await please.fill('input password', '#password', user.password)
            await please.click('button submit', '#submit')
        },

        async logout() {
            await please.click('button logout', 'text=Log out')
        },

        /** @param {string} expected */
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
