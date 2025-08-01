import { SharedArray } from 'k6/data';
import { petStoreJourney } from '../../journey/petstore-journey.js';

export let options = {
  stages: [
    { duration: '1s', target: 10 },     // Baseline - 10 users
    { duration: '1s', target: 100 },    // Ramp up to 100 users
    { duration: '1s', target: 200 },    // Ramp up to 200 users
    { duration: '1s', target: 300 },    // Ramp up to 300 users
    { duration: '1s', target: 400 },    // Ramp up to 400 users
    { duration: '1s', target: 0 },      // Scale down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<3000'],  // Response time thresholds
    http_req_failed: ['rate<0.05'],     // Error rate threshold
    http_reqs: ['rate>150'],            // Throughput threshold
  },
};

export default function () {
  petStoreJourney();
}
