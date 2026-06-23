// k6 load test — triggers ECS scale-out on staging
// Run: k6 run --env BASE_URL=https://staging.example.com tests/load/k6-staging.js

import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // ramp up
    { duration: '2m',  target: 100 },  // hold — should push CPU > 70%
    { duration: '30s', target: 0 },    // ramp down
  ],
  thresholds: {
    http_req_failed:   ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/health`);
  check(res, { 'status 200': (r) => r.status === 200 });
  sleep(0.1);
}
