import { makeRequest } from '../../utils/request.js';
import { assertStatus } from '../../utils/assertions.js';
import { Trend } from 'k6/metrics';
import { group } from 'k6';

const config = JSON.parse(open('../../configs/staging.json'));
const soakTrend = new Trend('petstore_soak_duration');

export let options = {
//   vus: 200,
  vus: 2,
  duration: '2h',
  tags: { test_type: 'soak', api: 'petstore' },
};

export default function () {
  group('Soak Get Pet', function () {
    const res = makeRequest({
      method: 'GET',
      url: `${config.baseUrl}/pet/3`,
    });
    soakTrend.add(res.timings.duration);
    assertStatus(res, 200);
  });
}
