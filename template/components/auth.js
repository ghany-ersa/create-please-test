const { PAGE } = require('../data/main')

class Auth {
    /** @param {import('please-test').default} please */
    constructor(please) {
        this.please = please
    }

    async goto() {
        await this.please.goto(PAGE.login)
    }

    /** @param {{ username: string, password: string }} user */
    async login(user) {
        await this.please.fill('input username', '#username', user.username)
        await this.please.fill('input password', '#password', user.password)
        await this.please.click('button submit', '#submit')
    }

    async logout() {
        await this.please.click('button logout', 'text=Log out')
    }

    /** @param {string} expected */
    async seeError(expected) {
        return this.please.see('pesan error', '#error', expected)
    }

    async seeDashboard() {
        await this.please.verifyPage(PAGE.dashboard)
        return this.please.see('teks sukses', 'h1', 'Logged In Successfully')
    }
}

module.exports = Auth
