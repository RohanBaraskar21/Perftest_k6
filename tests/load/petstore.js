import { makeRequest } from '../../utils/request.js';
import { assertStatus } from '../../utils/assertions.js';
import { Trend } from 'k6/metrics';
import { check, group } from 'k6';
import http from 'k6/http';
import { SharedArray } from 'k6/data';

const config = JSON.parse(open('../../configs/staging.json'));
const trendRT = new Trend('petstore_response_time');

export let options = {
//   vus: 50,
   vus: 2,
  // duration: '5m',
   duration: '5s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    'petstore_response_time': ['p(95)<500'],
  },
  tags: { test_type: 'load', api: 'petstore' },
};

export function setup() {
  // Setup code here (e.g., auth)
  return { token: 'dummy' };
}

export default function (data) {
  group('Get Pet by ID', function () {
    const res = makeRequest({
      method: 'GET',
      url: `${config.baseUrl}/pet/1`,
      headers: { Authorization: `Bearer ${data.token}` },
    });
    trendRT.add(res.timings.duration);
    assertStatus(res, 200);
    check(res, { 'body has id': (r) => r.json().id === 1 });
  });
}

export function teardown(data) {
  // Teardown code here
}
