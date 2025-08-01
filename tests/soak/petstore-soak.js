import { SharedArray } from 'k6/data';
import { petStoreJourney } from '../../journey/petstore-journey.js';

export let options = {
  stages: [
    // { duration: '2m', target: 10 },     // Ramp up to 10 users
    // { duration: '4h', target: 10 },     // Stay at 10 users for 4 hours
    // { duration: '2m', target: 0 },      // Ramp down to 0 users

    { duration: '1s', target: 10 },     // Ramp up to 10 users
    { duration: '1s', target: 10 },     // Stay at 10 users for 4 hours
    { duration: '1s', target: 0 },      // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    'http_req_duration{type:API}': ['p(95)<1000'],
    http_reqs: ['rate>50'],
    'http_req_failed{type:API}': ['rate<0.01'],  // API error rate should be below 1%
  },
};

export default function () {
  petStoreJourney();
}
