import { SharedArray } from 'k6/data';
import { petStoreJourney } from '../../journey/petstore-journey.js';

export let options = {
  stages: [
    // { duration: '1m', target: 10 },     // Baseline - 10 users
    // { duration: '2m', target: 10 },     // Maintain baseline
    // { duration: '1m', target: 100 },    // Spike to 100 users
    // { duration: '2m', target: 100 },    // Maintain spike
    // { duration: '1m', target: 10 },     // Scale down to baseline
    // { duration: '2m', target: 10 },     // Maintain baseline
    // { duration: '1m', target: 0 },      // Scale down to 0

    { duration: '1s', target: 10 },     // Baseline - 10 users
    { duration: '1s', target: 10 },     // Maintain baseline
    { duration: '1s', target: 100 },    // Spike to 100 users
    { duration: '1s', target: 100 },    // Maintain spike
    { duration: '1s', target: 10 },     // Scale down to baseline
    { duration: '1s', target: 10 },     // Maintain baseline
    { duration: '1s', target: 0 },      // Scale down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // More lenient threshold during spikes
    http_req_failed: ['rate<0.05'],     // Allow up to 5% errors during spikes
    http_reqs: ['rate>75'],
  },
};

export default function () {
  petStoreJourney();
}
