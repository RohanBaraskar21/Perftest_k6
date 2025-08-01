$testResultsPath = "test-results.json"
$reportTemplatePath = "report-template.html"
$outputReportPath = "load-test-report.html"

# Copy the template to the output file
Copy-Item $reportTemplatePath $outputReportPath

Write-Host "HTML report generated at: $outputReportPath"
Write-Host "Open the report in a browser to view the results."
