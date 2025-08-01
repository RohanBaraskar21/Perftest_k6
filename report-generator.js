import fs from 'fs';

function generateReport(jsonPath, htmlPath) {
    const fileContent = fs.readFileSync(jsonPath, 'utf8');
    const lines = fileContent.split('\n');
    const metrics = {};
    
    lines.forEach(line => {
        if (!line.trim()) return;
        const data = JSON.parse(line.trim());
        if (data.type === 'Point') {
            if (!metrics[data.metric]) {
                metrics[data.metric] = {
                    points: [],
                    info: null
                };
            }
            metrics[data.metric].points.push(data);
        } else if (data.type === 'Metric') {
            if (!metrics[data.metric]) {
                metrics[data.metric] = {
                    points: [],
                    info: data.data
                };
            } else {
                metrics[data.metric].info = data.data;
            }
        }
    });

    // Process metrics into summary data
    const summary = {
        http_reqs: {
            total: metrics.http_reqs?.points?.length || 0,
            success: metrics.http_reqs?.points?.filter(r => r.data.tags.expected_response === "true").length || 0,
            failed: metrics.http_reqs?.points?.filter(r => r.data.tags.expected_response === "false").length || 0
        },
        duration: {
            min: Math.min(...(metrics.http_req_duration?.points?.map(d => d.data.value) || [0])),
            max: Math.max(...(metrics.http_req_duration?.points?.map(d => d.data.value) || [0])),
            avg: metrics.http_req_duration?.points?.reduce((acc, d) => acc + d.data.value, 0) / (metrics.http_req_duration?.points?.length || 1)
        },
        vus: metrics.vus_max?.points?.[0]?.data.value || 0,
        checks: {
            total: metrics.checks?.points?.length || 0,
            passed: metrics.checks?.points?.filter(c => c.data.value === 1).length || 0,
            failed: metrics.checks?.points?.filter(c => c.data.value === 0).length || 0
        }
    };

    const template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>K6 Load Test Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .metric-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            border: 1px solid #eee;
        }
        .metric-title {
            font-size: 16px;
            color: #666;
            margin-bottom: 10px;
        }
        .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #333;
        }
        .sub-value {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
        }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        tr:hover {
            background-color: #f5f5f5;
        }
        .status-200 { color: #28a745; }
        .status-500 { color: #dc3545; }
        .status-404 { color: #ffc107; }
    </style>
</head>
<body>
    <div class="container">
        <h1>K6 Load Test Report</h1>
        
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-title">HTTP Requests</div>
                <div class="metric-value">${summary.http_reqs.total}</div>
                <div class="sub-value">
                    <span class="success">✓ ${summary.http_reqs.success}</span> / 
                    <span class="error">✗ ${summary.http_reqs.failed}</span>
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">Response Time</div>
                <div class="metric-value">${summary.duration.avg.toFixed(2)}ms</div>
                <div class="sub-value">
                    Min: ${summary.duration.min.toFixed(2)}ms / 
                    Max: ${summary.duration.max.toFixed(2)}ms
                </div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">Virtual Users (Max)</div>
                <div class="metric-value">${summary.vus}</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">Checks</div>
                <div class="metric-value">${summary.checks.passed}/${summary.checks.total}</div>
                <div class="sub-value">
                    Pass Rate: ${((summary.checks.passed / (summary.checks.total || 1)) * 100).toFixed(1)}%
                </div>
            </div>
        </div>

        <div>
            <h2>Request Details</h2>
            <table>
                <thead>
                    <tr>
                        <th>Endpoint</th>
                        <th>Method</th>
                        <th>Status</th>
                        <th>Response Time</th>
                    </tr>
                </thead>
                <tbody>
                    ${metrics.http_reqs?.points?.map(req => {
                        const duration = metrics.http_req_duration?.points?.find(d => 
                            d.data.time === req.data.time && 
                            d.data.tags.name === req.data.tags.name
                        )?.data.value || 0;
                        
                        return `
                            <tr>
                                <td>${req.data.tags.name}</td>
                                <td>${req.data.tags.method}</td>
                                <td class="status-${req.data.tags.status}">${req.data.tags.status}</td>
                                <td>${duration.toFixed(2)}ms</td>
                            </tr>
                        `;
                    }).join('') || '<tr><td colspan="4">No request data available</td></tr>'}
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>`;

    fs.writeFileSync(htmlPath, template);
}

// Get command line arguments for input and output files
const jsonPath = process.argv[2] || 'results/petstore-load.json';
const htmlPath = process.argv[3] || 'results/report.html';

try {
    generateReport(jsonPath, htmlPath);
    console.log(`Report generated successfully at ${htmlPath}`);
} catch (error) {
    console.error('Error generating report:', error);
    process.exit(1);
}
