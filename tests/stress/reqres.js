import { makeRequest } from '../../utils/request.js';
import { assertStatus } from '../../utils/assertions.js';
import { Gauge } from 'k6/metrics';
import { group } from 'k6';

const config = JSON.parse(open('../../configs/prod.json'));
const vuGauge = new Gauge('reqres_vus');

export let options = {
  stages: [
    // { duration: '1m', target: 50 },
    // { duration: '2m', target: 500 },
    // { duration: '2m', target: 1000 },
    // { duration: '1m', target: 0 },

     { duration: '1m', target: 1 },
    { duration: '2m', target: 1 },
    { duration: '2m', target: 1 },
    { duration: '1m', target: 0 },
  ],
  tags: { test_type: 'stress', api: 'reqres' },
};

export default function () {
  group('Stress List Users', function () {
    vuGauge.add(__VU);
    const res = makeRequest({
      method: 'GET',
      url: `${config.baseUrl}/users`,
    });
    assertStatus(res, 200);
  });
}
