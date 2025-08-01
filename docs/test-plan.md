# Sample Performance Test Plan

## Scope
- APIs: Petstore Swagger, Reqres.in
- Test Types: Load, Spike, Stress, Soak

## Acceptance Criteria
- Response time < 500ms for 95% of requests
- Error rate < 1%
- Throughput: 1000 RPS sustained

## Scenarios
- Load: 100 VUs, 10m
- Spike: 1000 VUs, 1m
- Stress: Ramp from 100 to 2000 VUs
- Soak: 200 VUs, 2h

## Reporting
- CLI, HTML, JSON, Grafana (optional)
