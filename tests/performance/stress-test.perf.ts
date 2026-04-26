/**
 * STRESS TESTING - rest-book-get API
 * Goal: Find the system's breaking point by pushing beyond normal capacity.
 * Scenario: Aggressively ramp up VUs in steps until the system degrades/fails.
 * Thresholds: Error rate monitored (expected to increase under stress).
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

const BASE_URL = 'https://restful-booker.herokuapp.com';

const responseTimeTrend = new Trend('stress_response_time_ms', true);
const errorRate = new Rate('stress_error_rate');
const requestCount = new Counter('stress_total_requests');

export const options = {
    stages: [
        { duration: '30s', target: 50 },   // Warm-up
        { duration: '1m',  target: 100 },  // Step 1
        { duration: '1m',  target: 150 },  // Step 2
        { duration: '1m',  target: 200 },  // Step 3 - beyond normal
        { duration: '1m',  target: 250 },  // Step 4 - stress zone
        { duration: '30s', target: 0 },    // Cool down
    ],
    thresholds: {
        http_req_duration: ['p(99)<5000'],  // 99% under 5s even under stress
        stress_error_rate: ['rate<0.10'],   // Accept up to 10% errors under stress
    },
};

function getAuthToken(): string {
    const res = http.post(`${BASE_URL}/auth`, JSON.stringify({
        username: 'admin',
        password: 'password123',
    }), { headers: { 'Content-Type': 'application/json' } });
    const body = res.json() as { token?: string };
    return body.token ?? '';
}

export default function () {
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    };

    // 1. GET all bookings (heaviest read operation)
    const getAllRes = http.get(`${BASE_URL}/booking`, { headers });
    responseTimeTrend.add(getAllRes.timings.duration);
    requestCount.add(1);
    errorRate.add(getAllRes.status !== 200);
    check(getAllRes, {
        'STRESS GET /booking - status 200': (r) => r.status === 200,
        'STRESS GET /booking - response time < 5s': (r) => r.timings.duration < 5000,
    });

    sleep(0.5);

    // 2. POST create booking under stress
    const createRes = http.post(`${BASE_URL}/booking`, JSON.stringify({
        firstname: 'Stress',
        lastname: 'Test',
        totalprice: 500,
        depositpaid: true,
        bookingdates: { checkin: '2024-06-01', checkout: '2024-06-30' },
        additionalneeds: 'None',
    }), { headers });
    responseTimeTrend.add(createRes.timings.duration);
    requestCount.add(1);
    errorRate.add(createRes.status !== 200);
    check(createRes, {
        'STRESS POST /booking - status 200': (r) => r.status === 200,
    });

    const bookingId = (createRes.json() as { bookingid?: number }).bookingid;

    sleep(0.5);

    // 3. DELETE the created booking to avoid data buildup
    if (bookingId) {
        const token = getAuthToken();
        const deleteRes = http.del(`${BASE_URL}/booking/${bookingId}`, null, {
            headers: { ...headers, Cookie: `token=${token}` },
        });
        responseTimeTrend.add(deleteRes.timings.duration);
        requestCount.add(1);
        errorRate.add(deleteRes.status !== 201);
        check(deleteRes, {
            'STRESS DELETE /booking/:id - status 201': (r) => r.status === 201,
        });
    }

    sleep(0.5);
}
