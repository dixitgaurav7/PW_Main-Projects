/**
 * ENDURANCE (SOAK) TESTING - rest-book-get API
 * Goal: Detect memory leaks, connection pool exhaustion, and slow degradation
 *       by running at moderate load for an extended period.
 * Scenario: Hold 30 VUs for 30 minutes.
 * Thresholds: Response times must stay stable throughout the run.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

const BASE_URL = 'https://restful-booker.herokuapp.com';

const responseTimeTrend = new Trend('endurance_response_time_ms', true);
const errorRate = new Rate('endurance_error_rate');
const requestCount = new Counter('endurance_total_requests');

export const options = {
    stages: [
        { duration: '2m',  target: 30 },  // Gentle ramp up
        { duration: '30m', target: 30 },  // Sustained soak period
        { duration: '2m',  target: 0 },   // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<3000'],  // Stay under 3s throughout the run
        endurance_error_rate: ['rate<0.01'], // Error rate must stay < 1%
        http_req_failed: ['rate<0.01'],
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
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    };

    // 1. GET all bookings
    const getAllRes = http.get(`${BASE_URL}/booking`, { headers });
    responseTimeTrend.add(getAllRes.timings.duration);
    requestCount.add(1);
    errorRate.add(getAllRes.status !== 200);
    check(getAllRes, {
        'SOAK GET /booking - status 200': (r) => r.status === 200,
        'SOAK GET /booking - stable response time': (r) => r.timings.duration < 3000,
    });

    sleep(2);

    // 2. GET single booking
    const getOneRes = http.get(`${BASE_URL}/booking/1`, { headers });
    responseTimeTrend.add(getOneRes.timings.duration);
    requestCount.add(1);
    errorRate.add(getOneRes.status !== 200);
    check(getOneRes, {
        'SOAK GET /booking/1 - status 200': (r) => r.status === 200,
    });

    sleep(2);

    // 3. POST create booking
    const createRes = http.post(`${BASE_URL}/booking`, JSON.stringify({
        firstname: 'Soak',
        lastname: 'Test',
        totalprice: 300,
        depositpaid: true,
        bookingdates: { checkin: '2024-03-01', checkout: '2024-03-15' },
        additionalneeds: 'Dinner',
    }), { headers });
    responseTimeTrend.add(createRes.timings.duration);
    requestCount.add(1);
    errorRate.add(createRes.status !== 200);
    check(createRes, {
        'SOAK POST /booking - status 200': (r) => r.status === 200,
    });

    const bookingId = (createRes.json() as { bookingid?: number }).bookingid;

    sleep(2);

    // 4. PATCH partial update
    if (bookingId) {
        const patchRes = http.patch(`${BASE_URL}/booking/${bookingId}`, JSON.stringify({
            firstname: 'SoakUpdated',
        }), {
            headers: { ...headers, Cookie: `token=${token}` },
        });
        responseTimeTrend.add(patchRes.timings.duration);
        requestCount.add(1);
        errorRate.add(patchRes.status !== 200);
        check(patchRes, { 'SOAK PATCH /booking/:id - status 200': (r) => r.status === 200 });

        sleep(1);

        // 5. DELETE to clean up
        const deleteRes = http.del(`${BASE_URL}/booking/${bookingId}`, null, {
            headers: { ...headers, Cookie: `token=${token}` },
        });
        responseTimeTrend.add(deleteRes.timings.duration);
        requestCount.add(1);
        errorRate.add(deleteRes.status !== 201);
        check(deleteRes, { 'SOAK DELETE /booking/:id - status 201': (r) => r.status === 201 });
    }

    sleep(2);
}
