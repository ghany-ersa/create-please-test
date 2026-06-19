require('dotenv').config()

const { defineConfig, devices } = require('@playwright/test')

module.exports = defineConfig({
    testDir: './feature',
    timeout: 60000,
    reporter: 'html',
    use: {
        headless: true,
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        baseURL: process.env.BASE_URL,
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
})
