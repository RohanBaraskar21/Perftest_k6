import { SharedArray } from 'k6/data';
import { petStoreJourney } from '../journey/petstore-journey.js';

export let options = {
  stages: [
    // { duration: '2m', target: 50 },    // Ramp up to 50 users over 2 minutes
    // { duration: '5m', target: 50 },    // Stay at 50 users for 5 minutes
    // { duration: '2m', target: 0 },     // Ramp down to 0 users over 2 minutes

    { duration: '1s', target: 1 },    // Ramp up to 50 users over 2 minutes
    { duration: '1s', target: 1 },    // Stay at 50 users for 5 minutes
    { duration: '1s', target: 0 },     // Ramp down to 0 users over 2 minutes
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],  // 95% of requests should be below 1s
    'http_req_duration{type:API}': ['p(95)<1000'],  // API-specific threshold
    // http_reqs: ['rate>100'],  // Throughput threshold
  },
};

export default function () {
  petStoreJourney();
}
