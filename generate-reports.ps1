# PowerShell script to run all k6 test suites and generate HTML reports

$tests = @(
    @{ name = 'petstore-load';    script = 'tests/load/petstore.js'    },
    @{ name = 'reqres-load';      script = 'tests/load/reqres.js'      },
    @{ name = 'petstore-spike';   script = 'tests/spike/petstore.js'   },
    @{ name = 'reqres-stress';    script = 'tests/stress/reqres.js'    },
    @{ name = 'petstore-soak';    script = 'tests/soak/petstore.js'    }
)

if (!(Test-Path results)) { New-Item -ItemType Directory -Path results | Out-Null }

foreach ($test in $tests) {
    $json = "results/$($test.name).json"
    $html = "results/$($test.name).html"
    Write-Host "Running $($test.script)..."
    k6 run --summary-export=$json $($test.script)
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Generating HTML report for $($test.name)..."
        npx k6-summary $json > $html
    } else {
        Write-Host "Test $($test.name) failed, skipping HTML report."
    }
}
Write-Host "All test suites complete. Reports are in the results/ folder."
