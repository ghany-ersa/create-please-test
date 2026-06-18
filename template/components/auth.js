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
        await this.please.click('button logout', 'link=Log out')
    }
}

module.exports = Auth
