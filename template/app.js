const Please = require('please-test')
const Auth = require('./components/auth')

/**
 * @param {import('@playwright/test').Page} page
 * @returns {{ please: import('please-test').default, AUTH: Auth }}
 */
function createApp(page) {
    const please = new Please(page)
    return {
        please,
        AUTH: new Auth(please)
    }
}

module.exports = { createApp }
