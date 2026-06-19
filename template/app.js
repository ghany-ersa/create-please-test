const Please = require('please-test')
const Auth = require('./components/auth')

/**
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').TestType<any,any>} [test]
 * @returns {{ please: import('please-test').default, AUTH: Auth }}
 */
function createApp(page, test) {
    const please = new Please(page, test)
    return {
        please,
        AUTH: new Auth(please)
    }
}

module.exports = { createApp }
