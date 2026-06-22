const { execSync } = require('child_process')
const path = require('path')

const report = path.resolve(__dirname, '..', 'please-report', 'index.html')
const cmd = process.platform === 'win32'
    ? `start "" "${report}"`
    : process.platform === 'darwin'
        ? `open "${report}"`
        : `xdg-open "${report}"`

try { execSync(cmd) } catch (_) {}
