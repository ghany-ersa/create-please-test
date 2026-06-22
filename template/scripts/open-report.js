const http = require('http')
const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

const reportDir = path.resolve(__dirname, '..', 'please-report')
const indexHtml = path.join(reportDir, 'index.html')
const port = 9323

if (!fs.existsSync(indexHtml)) {
    console.error('\nNo report found. Run "npm test" first.\n')
    process.exit(1)
}

const server = http.createServer((req, res) => {
    const filePath = path.join(reportDir, req.url === '/' ? 'index.html' : req.url)
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404)
            res.end('Not found')
            return
        }
        const ext = path.extname(filePath)
        const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript' }[ext] || 'application/octet-stream'
        res.writeHead(200, { 'Content-Type': mime })
        res.end(data)
    })
})

server.listen(port, () => {
    const url = `http://localhost:${port}`
    console.log(`\nPlease Report: ${url}\n`)
    const open = process.platform === 'win32' ? `start ${url}` : process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`
    exec(open)
})

process.on('SIGINT', () => { server.close(); process.exit() })
