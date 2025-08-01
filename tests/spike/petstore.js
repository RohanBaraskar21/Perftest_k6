import { makeRequest } from '../../utils/request.js';
import { assertStatus } from '../../utils/assertions.js';
import { Counter } from 'k6/metrics';
import { group } from 'k6';

const config = JSON.parse(open('../../configs/staging.json'));
const errorCount = new Counter('petstore_spike_errors');

export let options = {
  stages: [
    { duration: '30s', target: 1 },
    { duration: '30s', target: 1 },
    { duration: '1m', target: 1 },
    { duration: '30s', target: 1 },

    //   { duration: '30s', target: 10 },
    // { duration: '30s', target: 1000 },
    // { duration: '1m', target: 1000 },
    // { duration: '30s', target: 10 },
  ],
  tags: { test_type: 'spike', api: 'petstore' },
};

export default function () {
  group('Spike Get Pet', function () {
    const res = makeRequest({
      method: 'GET',
      url: `${config.baseUrl}/pet/2`,
    });
    if (res.status !== 200) errorCount.add(1);
    assertStatus(res, 200);
  });
}
