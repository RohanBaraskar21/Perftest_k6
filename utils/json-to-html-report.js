// Simple Node.js script to convert k6 summary JSON to a basic HTML report
import fs from 'fs';

const input = process.argv[2];
const output = process.argv[3] || 'results/simple-report.html';

if (!input) {
  console.error('Usage: node utils/json-to-html-report.js <input.json> [output.html]');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(input, 'utf-8'));

function metricTable(metrics) {
  let html = '<table border="1" cellpadding="5"><tr><th>Metric</th><th>Avg</th><th>Min</th><th>Max</th><th>p(90)</th><th>p(95)</th></tr>';
  for (const [name, m] of Object.entries(metrics)) {
    if (typeof m === 'object' && 'avg' in m) {
      html += `<tr><td>${name}</td><td>${m.avg}</td><td>${m.min}</td><td>${m.max}</td><td>${m['p(90)']}</td><td>${m['p(95)']}</td></tr>`;
    }
  }
  html += '</table>';
  return html;
}

function checksTable(root) {
  let html = '<table border="1" cellpadding="5"><tr><th>Group</th><th>Check</th><th>Passes</th><th>Fails</th></tr>';
  function walk(group, groupName) {
    if (group.checks) {
      for (const [check, c] of Object.entries(group.checks)) {
        html += `<tr><td>${groupName}</td><td>${check}</td><td>${c.passes}</td><td>${c.fails}</td></tr>`;
      }
    }
    if (group.groups) {
      for (const [sub, g] of Object.entries(group.groups)) {
        walk(g, g.name || sub);
      }
    }
  }
  walk(data.root_group, 'root');
  html += '</table>';
  return html;
}

const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>k6 Simple Report</title></head><body>
<h1>k6 Test Report</h1>
<h2>Metrics</h2>
${metricTable(data.metrics)}
<h2>Checks</h2>
${checksTable(data.root_group)}
</body></html>`;

fs.writeFileSync(output, html);
console.log(`HTML report generated: ${output}`);
