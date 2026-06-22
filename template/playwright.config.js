require('dotenv').config()

const { defineConfig, devices } = require('@playwright/test')

const browserMap = {
    chromium: devices['Desktop Chrome'],
    firefox:  devices['Desktop Firefox'],
    webkit:   devices['Desktop Safari'],
}

const browser = process.env.BROWSER || 'chromium'

if (!browserMap[browser]) {
    throw new Error(`BROWSER="${browser}" tidak dikenali. Pilihan: chromium, firefox, webkit`)
}

module.exports = defineConfig({
    testDir: './feature',
    timeout: 60000,
    reporter: [
        ['list'],
        ['./reporter/please-reporter.js'],
    ],
    use: {
        headless: process.env.HEADLESS !== 'false',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        baseURL: process.env.BASE_URL,
    },
    projects: [
        { name: browser, use: { ...browserMap[browser] } },
    ],
})
