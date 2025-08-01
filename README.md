# k6 Performance Testing Framework

## Overview
This repository demonstrates an industry-standard performance testing framework using the k6 tool. It includes modular test scripts, utilities, environment-based data, and CI/CD integration for public REST APIs.

## Features
- Modular folder structure for tests, configs, utilities, and results
- Environment-based test data (staging, prod)
- Load, spike, stress, and soak test examples
- Sample tests for Petstore Swagger API and Reqres.in
- Parameterized requests (JSON/CSV)
- Dynamic VU scaling, setup/teardown, tagging, grouping
- Custom metrics (Trend, Rate, Counter, Gauge)
- Reporting: CLI, HTML (k6-summary), JSON, InfluxDB/Grafana (optional)
- GitHub Actions workflow for CI and report upload

## Setup Instructions
1. Install [k6](https://k6.io/docs/getting-started/installation/)
2. Clone this repo
3. Install dev dependencies: `npm install`
4. Copy `.env.example` to `.env` and set secrets if needed

## Running Tests
- Run a test: `k6 run tests/load/petstore.js`
- Generate HTML report: `k6 run --summary-export=results/summary.json tests/load/petstore.js && npx k6-summary results/summary.json > results/summary.html`

## CI/CD Integration
- See `.github/workflows/ci.yml` for GitHub Actions setup

## Example Outputs
- See `/results` for sample reports and screenshots

## Docs
- See `/docs` for test plan and acceptance criteria

---

> For more details, see comments and docstrings in the code.
