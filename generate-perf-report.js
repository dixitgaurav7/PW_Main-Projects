/**
 * K6 Performance Test HTML Report Generator
 * Reads all JSON summary files from performance-results/ and generates a styled HTML report.
 * Run: node generate-perf-report.js
 */

const fs = require('fs');
const path = require('path');

const resultsDir = path.join(__dirname, 'performance-results');
const reportPath = path.join(__dirname, 'performance-report', 'index.html');

fs.mkdirSync(path.join(__dirname, 'performance-report'), { recursive: true });

const testFiles = fs.readdirSync(resultsDir).filter(f => f.endsWith('.json'));

function statusBadge(passed) {
    return passed
        ? '<span style="background:#22c55e;color:#fff;padding:2px 10px;border-radius:12px;font-size:12px;">PASSED</span>'
        : '<span style="background:#ef4444;color:#fff;padding:2px 10px;border-radius:12px;font-size:12px;">FAILED</span>';
}

function formatMs(val) {
    if (val === undefined || val === null) return 'N/A';
    return typeof val === 'number' ? `${val.toFixed(1)} ms` : 'N/A';
}

function formatRate(val) {
    if (val === undefined || val === null) return 'N/A';
    return typeof val === 'number' ? `${(val * 100).toFixed(2)}%` : 'N/A';
}

function metricRow(label, value) {
    return `<tr><td style="color:#94a3b8;padding:6px 12px;">${label}</td><td style="color:#f1f5f9;padding:6px 12px;font-weight:600;">${value}</td></tr>`;
}

const testCards = testFiles.map(file => {
    const raw = fs.readFileSync(path.join(resultsDir, file), 'utf-8');
    const data = JSON.parse(raw);
    const testName = file.replace('.json', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    const metrics = data.metrics || {};
    const httpDuration = metrics['http_req_duration'];
    const httpFailed = metrics['http_req_failed'];
    const httpReqs = metrics['http_reqs'];
    const vus = metrics['vus_max'];

    const avgDuration = httpDuration?.values?.avg;
    const p95Duration = httpDuration?.values?.['p(95)'];
    const p99Duration = httpDuration?.values?.['p(99)'];
    const failRate = httpFailed?.values?.rate;
    const totalReqs = httpReqs?.values?.count;
    const maxVUs = vus?.values?.max;

    const thresholds = data.root_group?.checks || {};
    const allPassed = httpFailed?.thresholds
        ? Object.values(httpFailed.thresholds).every(t => t.ok)
        : failRate < 0.05;

    const typeColors = {
        'Load Test': '#3b82f6',
        'Stress Test': '#f97316',
        'Spike Test': '#a855f7',
        'Scalability Test': '#06b6d4',
        'Volume Test': '#84cc16',
        'Endurance Test': '#ec4899',
    };
    const color = Object.entries(typeColors).find(([k]) => testName.includes(k.split(' ')[0]))?.[1] || '#6366f1';

    return `
    <div style="background:#1e293b;border-radius:16px;padding:24px;border:1px solid #334155;transition:transform 0.2s;" onmouseover="this.style.transform='translateY(-4px)'" onmouseout="this.style.transform='none'">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <div>
                <div style="width:10px;height:10px;border-radius:50%;background:${color};display:inline-block;margin-right:8px;"></div>
                <span style="color:#f1f5f9;font-size:18px;font-weight:700;">${testName}</span>
            </div>
            ${statusBadge(allPassed)}
        </div>
        <table style="width:100%;border-collapse:collapse;">
            <tbody>
                ${metricRow('Avg Response Time', formatMs(avgDuration))}
                ${metricRow('p(95) Response Time', formatMs(p95Duration))}
                ${metricRow('p(99) Response Time', formatMs(p99Duration))}
                ${metricRow('Error Rate', formatRate(failRate))}
                ${metricRow('Total Requests', totalReqs ? totalReqs.toLocaleString() : 'N/A')}
                ${metricRow('Max VUs', maxVUs ?? 'N/A')}
            </tbody>
        </table>
    </div>`;
}).join('\n');

const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
    <title>K6 API Performance Report | Restful Booker</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
    <style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{background:#0f172a;color:#f1f5f9;font-family:'Inter',sans-serif;min-height:100vh;padding:40px 24px;}
        .header{text-align:center;margin-bottom:48px;}
        .badge{display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:4px 16px;border-radius:20px;font-size:12px;font-weight:600;margin-bottom:16px;letter-spacing:1px;}
        h1{font-size:36px;font-weight:800;background:linear-gradient(135deg,#e2e8f0,#94a3b8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px;}
        .subtitle{color:#64748b;font-size:14px;}
        .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:24px;max-width:1400px;margin:0 auto;}
        .summary-bar{display:flex;justify-content:center;gap:32px;margin-bottom:40px;flex-wrap:wrap;}
        .stat{text-align:center;background:#1e293b;padding:16px 32px;border-radius:12px;border:1px solid #334155;}
        .stat-value{font-size:28px;font-weight:800;color:#6366f1;}
        .stat-label{font-size:12px;color:#64748b;margin-top:4px;}
        .footer{text-align:center;color:#334155;font-size:12px;margin-top:48px;}
    </style>
</head>
<body>
    <div class="header">
        <div class="badge">K6 PERFORMANCE REPORT</div>
        <h1>Restful Booker API — Performance Dashboard</h1>
        <p class="subtitle">Generated on ${now} | Base URL: https://restful-booker.herokuapp.com</p>
    </div>
    <div class="summary-bar">
        <div class="stat"><div class="stat-value">${testFiles.length}</div><div class="stat-label">Test Suites Run</div></div>
        <div class="stat"><div class="stat-value" style="color:#22c55e;">6</div><div class="stat-label">API Endpoints Tested</div></div>
        <div class="stat"><div class="stat-value" style="color:#f97316;">6</div><div class="stat-label">Test Types</div></div>
    </div>
    <div class="grid">
        ${testCards}
    </div>
    <div class="footer">
        <p>Restful Booker Performance Suite &bull; Powered by k6 &bull; ${now}</p>
    </div>
</body>
</html>`;

fs.writeFileSync(reportPath, html, 'utf-8');
console.log(`\n✅ Report generated: ${reportPath}\n`);
