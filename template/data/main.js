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
        valid: {
            username: process.env.ACCOUNT_USERNAME,
            password: process.env.ACCOUNT_PASSWORD,
        },
        wrongPassword: {
            username: process.env.ACCOUNT_USERNAME,
            password: 'wrongpassword',
        },
        wrongUsername: {
            username: 'invaliduser',
            password: process.env.ACCOUNT_PASSWORD,
        },
        empty: {
            username: '',
            password: '',
        },
    },
}