require('dotenv').config()

const baseUrl = process.env.BASE_URL

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
        valid: {
            username: process.env.ACCOUNT_USERNAME,
            password: process.env.ACCOUNT_PASSWORD
        },
        wrongPassword: {
            username: process.env.ACCOUNT_USERNAME,
            password: 'wrongpassword'
        },
        wrongUsername: {
            username: 'invaliduser',
            password: process.env.ACCOUNT_PASSWORD
        },
        empty: {
            username: '',
            password: ''
        }
    }
}
