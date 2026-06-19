#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const projectName = process.argv[2]

if (!projectName) {
    console.error('\nUsage:')
    console.error('  npm create please-test@latest <project-name>\n')
    console.error('Note: This is a scaffolding tool, not a library.')
    console.error('  Do not use "npm i create-please-test".\n')
    process.exit(1)
}

const targetDir = path.resolve(process.cwd(), projectName)

if (fs.existsSync(targetDir)) {
    console.error(`Directory "${projectName}" already exists.`)
    process.exit(1)
}

const templateDir = path.join(__dirname, 'template')

function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true })
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name)
        const destName = entry.name === '_gitignore' ? '.gitignore' : entry.name
        const destPath = path.join(dest, destName)
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath)
        } else {
            fs.copyFileSync(srcPath, destPath)
        }
    }
}

copyDir(templateDir, targetDir)

// Inject project name into package.json
const pkgPath = path.join(targetDir, 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
pkg.name = projectName
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 4) + '\n')

console.log(`\nProject "${projectName}" created successfully!\n`)
console.log('Next steps:\n')
console.log(`  cd ${projectName}`)
console.log('  npm install')
console.log('  npx playwright install chromium')
console.log('  cp .env.example .env   # then fill in your app URL and credentials')
console.log('  npm test\n')
