// @ts-check
'use strict'

const fs = require('fs')
const path = require('path')

/**
 * @typedef {{ title: string, status: 'passed'|'failed'|'skipped'|'timedOut', duration: number, error?: string, steps: {title:string,duration:number,error?:string}[] }} TestResult
 * @typedef {{ title: string, file: string, tests: TestResult[] }} Suite
 */

class PleaseReporter {
    constructor(options = {}) {
        this._outputFile = options.outputFile || 'please-report/index.html'
        /** @type {Suite[]} */
        this._suites = []
        this._startTime = Date.now()
    }

    onBegin(_config, suite) {
        this._rootSuite = suite
    }

    onEnd(_result) {
        const suites = this._collectSuites(this._rootSuite)
        const html = this._buildHtml(suites)
        const outputPath = path.resolve(process.cwd(), this._outputFile)
        fs.mkdirSync(path.dirname(outputPath), { recursive: true })
        fs.writeFileSync(outputPath, html, 'utf8')
        console.log(`\nRun "npm run report" to open it in the browser.\n`)
    }

    /** @param {any} suite @returns {Suite[]} */
    _collectSuites(suite) {
        const results = []
        if (!suite) return results

        if (suite.tests && suite.tests.length > 0) {
            const tests = suite.tests.map(t => {
                const result = t.results[0] || {}
                const steps = (result.steps || []).map(s => ({
                    title: s.title,
                    duration: s.duration,
                    error: s.error?.message,
                }))
                return {
                    title: t.title,
                    status: result.status || 'skipped',
                    duration: result.duration || 0,
                    error: result.error?.message,
                    steps,
                }
            })
            results.push({
                title: suite.title || 'Tests',
                file: suite.location?.file || '',
                tests,
            })
        }

        for (const child of suite.suites || []) {
            results.push(...this._collectSuites(child))
        }

        return results
    }

    /** @param {Suite[]} suites @returns {string} */
    _buildHtml(suites) {
        const totalDuration = Date.now() - this._startTime
        const allTests = suites.flatMap(s => s.tests)
        const passed = allTests.filter(t => t.status === 'passed').length
        const failed = allTests.filter(t => t.status === 'failed').length
        const skipped = allTests.filter(t => t.status === 'skipped' || t.status === 'timedOut').length
        const total = allTests.length
        const passRate = total > 0 ? Math.round((passed / total) * 100) : 0

        const suiteBlocks = suites.map(s => this._buildSuiteBlock(s)).join('\n')
        const runAt = new Date().toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })

        return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Please Report</title>
  <style>
    /* ── Design Tokens (Please Blocks theme) ── */
    :root {
      --color-bg-deepest: #0a0d14;
      --color-bg-base:    #0f1117;
      --color-bg-surface: #111827;
      --color-bg-scrim:   rgba(0,0,0,.65);

      --color-border-subtle:  #1e293b;
      --color-border-default: #334155;
      --color-border-strong:  #475569;

      --color-text-primary:   #e2e8f0;
      --color-text-secondary: #94a3b8;
      --color-text-muted:     #64748b;
      --color-text-faint:     #475569;

      --color-primary:        #6366f1;
      --color-primary-light:  #818cf8;
      --color-primary-bg:     rgba(99,102,241,.10);
      --color-primary-border: rgba(99,102,241,.25);

      --color-success:        #10b981;
      --color-success-light:  #34d399;
      --color-success-bg:     rgba(16,185,129,.15);
      --color-success-border: rgba(16,185,129,.35);

      --color-danger:         #ef4444;
      --color-danger-light:   #f87171;
      --color-danger-bg:      rgba(239,68,68,.10);
      --color-danger-border:  rgba(239,68,68,.30);

      --color-warning:        #f59e0b;
      --color-warning-text:   #fbbf24;
      --color-warning-bg:     rgba(245,158,11,.10);
      --color-warning-border: rgba(245,158,11,.30);

      --color-purple:         #a855f7;
      --color-purple-bg:      rgba(168,85,247,.08);

      --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      --font-mono: 'SF Mono','Fira Code','Cascadia Code','Consolas', monospace;

      --text-xs:   11px;
      --text-sm:   12px;
      --text-base: 13px;
      --text-md:   14px;
      --text-lg:   15px;
      --text-xl:   16px;
      --text-2xl:  18px;
      --text-hero: 28px;

      --radius-sm: 3px;
      --radius-md: 5px;
      --radius-lg: 6px;
      --radius-xl: 8px;
      --radius-2xl:12px;

      --shadow-sm: 0 2px 8px rgba(0,0,0,.40);
      --shadow-md: 0 8px 24px rgba(0,0,0,.50);
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--font-sans);
      font-size: var(--text-base);
      background: var(--color-bg-base);
      color: var(--color-text-primary);
      min-height: 100vh;
    }

    /* ── Topbar ── */
    .topbar {
      height: 46px;
      background: var(--color-bg-surface);
      border-bottom: 1px solid var(--color-border-subtle);
      display: flex;
      align-items: center;
      padding: 0 24px;
      gap: 10px;
      position: sticky;
      top: 0;
      z-index: 10;
      box-shadow: var(--shadow-sm);
    }
    .topbar-logo {
      font-size: var(--text-md);
      font-weight: 700;
      color: var(--color-primary-light);
      letter-spacing: .03em;
    }
    .topbar-logo span { color: var(--color-purple); }
    .topbar-meta {
      margin-left: auto;
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }

    /* ── Layout ── */
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 32px 24px 64px;
    }

    /* ── Summary Cards ── */
    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
      margin-bottom: 32px;
    }
    .card {
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-xl);
      padding: 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .card-label {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: .06em;
      font-weight: 600;
    }
    .card-value {
      font-size: var(--text-hero);
      font-weight: 800;
      line-height: 1;
    }
    .card.passed  { border-color: var(--color-success-border); }
    .card.passed  .card-value { color: var(--color-success-light); }
    .card.failed  { border-color: var(--color-danger-border); }
    .card.failed  .card-value { color: var(--color-danger-light); }
    .card.skipped { border-color: var(--color-border-default); }
    .card.skipped .card-value { color: var(--color-text-secondary); }
    .card.rate    { border-color: var(--color-primary-border); }
    .card.rate    .card-value { color: var(--color-primary-light); }
    .card.total   .card-value { color: var(--color-text-primary); }

    /* ── Progress Bar ── */
    .progress-wrap {
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-xl);
      padding: 16px 20px;
      margin-bottom: 32px;
    }
    .progress-label {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: .06em;
      font-weight: 600;
      margin-bottom: 10px;
    }
    .progress-bar {
      height: 6px;
      background: var(--color-border-subtle);
      border-radius: var(--radius-pill, 999px);
      overflow: hidden;
      display: flex;
      gap: 2px;
    }
    .progress-bar .seg-passed  { background: var(--color-success); }
    .progress-bar .seg-failed  { background: var(--color-danger); }
    .progress-bar .seg-skipped { background: var(--color-border-default); }

    /* ── Suite ── */
    .suite {
      margin-bottom: 20px;
      background: var(--color-bg-surface);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-xl);
      overflow: hidden;
    }
    .suite-header {
      padding: 12px 16px;
      border-bottom: 1px solid var(--color-border-subtle);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .suite-title {
      font-size: var(--text-md);
      font-weight: 600;
      color: var(--color-text-primary);
    }
    .suite-file {
      margin-left: auto;
      font-size: var(--text-xs);
      color: var(--color-text-faint);
      font-family: var(--font-mono);
    }
    .suite-count {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      background: var(--color-border-subtle);
      border-radius: 999px;
      padding: 1px 7px;
    }

    /* ── Test Row ── */
    .test-row {
      border-bottom: 1px solid var(--color-border-subtle);
    }
    .test-row:last-child { border-bottom: none; }

    .test-summary {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      cursor: pointer;
      user-select: none;
      transition: background .12s ease;
    }
    .test-summary:hover { background: rgba(255,255,255,.02); }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .status-dot.passed  { background: var(--color-success); }
    .status-dot.failed  { background: var(--color-danger); }
    .status-dot.skipped,
    .status-dot.timedOut { background: var(--color-text-faint); }

    .test-title {
      font-size: var(--text-base);
      flex: 1;
    }

    .badge {
      font-size: var(--text-xs);
      font-weight: 600;
      padding: 1px 7px;
      border-radius: 999px;
      text-transform: uppercase;
      letter-spacing: .05em;
    }
    .badge.passed  { background: var(--color-success-bg);  color: var(--color-success-light);  border: 1px solid var(--color-success-border); }
    .badge.failed  { background: var(--color-danger-bg);   color: var(--color-danger-light);   border: 1px solid var(--color-danger-border); }
    .badge.skipped { background: rgba(255,255,255,.04);    color: var(--color-text-muted);     border: 1px solid var(--color-border-default); }
    .badge.timedOut{ background: var(--color-warning-bg);  color: var(--color-warning-text);   border: 1px solid var(--color-warning-border); }

    .duration {
      font-size: var(--text-xs);
      color: var(--color-text-faint);
      font-family: var(--font-mono);
      min-width: 52px;
      text-align: right;
    }

    .chevron {
      font-size: 10px;
      color: var(--color-text-faint);
      transition: transform .15s ease;
      flex-shrink: 0;
    }

    /* ── Test Detail (steps + error) ── */
    .test-detail {
      display: none;
      padding: 0 16px 12px 34px;
      border-top: 1px solid var(--color-border-subtle);
    }
    .test-detail.open { display: block; }

    .steps {
      margin-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .step {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
    }
    .step:hover { background: rgba(255,255,255,.02); }
    .step-icon { color: var(--color-success); font-size: 10px; flex-shrink: 0; }
    .step-icon.err { color: var(--color-danger); }
    .step-title { flex: 1; color: var(--color-text-secondary); }
    .step-dur { font-size: var(--text-xs); color: var(--color-text-faint); font-family: var(--font-mono); }

    .error-block {
      margin-top: 10px;
      background: var(--color-danger-bg);
      border: 1px solid var(--color-danger-border);
      border-radius: var(--radius-lg);
      padding: 10px 12px;
      font-family: var(--font-mono);
      font-size: var(--text-sm);
      color: var(--color-danger-light);
      white-space: pre-wrap;
      word-break: break-word;
      line-height: 1.6;
    }

    /* ── Footer ── */
    .footer {
      margin-top: 48px;
      text-align: center;
      font-size: var(--text-xs);
      color: var(--color-text-faint);
    }
    .footer a { color: var(--color-primary-light); text-decoration: none; }
    .footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>

<header class="topbar">
  <div class="topbar-logo">please<span>.</span>report</div>
  <div class="topbar-meta">${runAt} &nbsp;·&nbsp; ${this._msToHuman(totalDuration)}</div>
</header>

<main class="container">

  <div class="summary">
    <div class="card total">
      <div class="card-label">Total</div>
      <div class="card-value">${total}</div>
    </div>
    <div class="card passed">
      <div class="card-label">Passed</div>
      <div class="card-value">${passed}</div>
    </div>
    <div class="card failed">
      <div class="card-label">Failed</div>
      <div class="card-value">${failed}</div>
    </div>
    <div class="card skipped">
      <div class="card-label">Skipped</div>
      <div class="card-value">${skipped}</div>
    </div>
    <div class="card rate">
      <div class="card-label">Pass rate</div>
      <div class="card-value">${passRate}%</div>
    </div>
  </div>

  <div class="progress-wrap">
    <div class="progress-label">Test distribution</div>
    <div class="progress-bar">
      ${total > 0 ? `
      <div class="seg-passed"  style="width:${(passed/total*100).toFixed(1)}%"></div>
      <div class="seg-failed"  style="width:${(failed/total*100).toFixed(1)}%"></div>
      <div class="seg-skipped" style="width:${(skipped/total*100).toFixed(1)}%"></div>
      ` : ''}
    </div>
  </div>

  ${suiteBlocks}

</main>

<footer class="footer">
  Generated by <a href="https://github.com/ghanyabdillahersa/create-please-test.js" target="_blank">please-test</a>
</footer>

<script>
  document.querySelectorAll('.test-summary').forEach(function(el) {
    el.addEventListener('click', function() {
      var detail = el.nextElementSibling
      var chevron = el.querySelector('.chevron')
      if (!detail || !detail.classList.contains('test-detail')) return
      var open = detail.classList.toggle('open')
      if (chevron) chevron.style.transform = open ? 'rotate(90deg)' : ''
    })
  })
</script>

</body>
</html>`
    }

    /** @param {Suite} suite @returns {string} */
    _buildSuiteBlock(suite) {
        const rows = suite.tests.map((t, i) => this._buildTestRow(t, i)).join('\n')
        const relFile = suite.file
            ? suite.file.replace(process.cwd() + path.sep, '').replace(/\\/g, '/')
            : ''
        return `
<section class="suite">
  <div class="suite-header">
    <span class="suite-title">${this._esc(suite.title)}</span>
    <span class="suite-count">${suite.tests.length}</span>
    ${relFile ? `<span class="suite-file">${this._esc(relFile)}</span>` : ''}
  </div>
  ${rows}
</section>`
    }

    /** @param {TestResult} t @param {number} idx @returns {string} */
    _buildTestRow(t, idx) {
        const hasDetail = t.steps.length > 0 || !!t.error
        const stepsHtml = t.steps.map(s => `
    <div class="step">
      <span class="step-icon${s.error ? ' err' : ''}">${s.error ? '✕' : '✓'}</span>
      <span class="step-title">${this._esc(s.title)}</span>
      <span class="step-dur">${this._msToHuman(s.duration)}</span>
    </div>`).join('')

        const errorHtml = t.error
            ? `<div class="error-block">${this._esc(t.error)}</div>`
            : ''

        return `
<div class="test-row">
  <div class="test-summary"${!hasDetail ? ' style="cursor:default"' : ''}>
    <span class="status-dot ${t.status}"></span>
    <span class="test-title">${this._esc(t.title)}</span>
    <span class="badge ${t.status}">${t.status}</span>
    <span class="duration">${this._msToHuman(t.duration)}</span>
    ${hasDetail ? '<span class="chevron">▶</span>' : ''}
  </div>
  ${hasDetail ? `
  <div class="test-detail">
    <div class="steps">${stepsHtml}</div>
    ${errorHtml}
  </div>` : ''}
</div>`
    }

    /** @param {number} ms @returns {string} */
    _msToHuman(ms) {
        if (ms < 1000) return `${ms}ms`
        if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
        return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`
    }

    /** @param {string} str @returns {string} */
    _esc(str) {
        return String(str ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
    }
}

module.exports = PleaseReporter
