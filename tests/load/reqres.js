import { makeRequest } from '../../utils/request.js';
import { assertStatus } from '../../utils/assertions.js';
import { Rate } from 'k6/metrics';
import { group } from 'k6';

const config = JSON.parse(open('../../configs/prod.json'));
const successRate = new Rate('reqres_success_rate');

export let options = {
//   vus: 30,
   vus: 1,
//   duration: '3m',
  duration: '10s',
  thresholds: {
    'reqres_success_rate': ['rate>0.99'],
  },
  tags: { test_type: 'load', api: 'reqres' },
};

export default function () {
  group('List Users', function () {
    const res = makeRequest({
      method: 'GET',
      url: `${config.baseUrl}/users?page=2`,
    });
    successRate.add(res.status === 200);
    assertStatus(res, 200);
  });
}
