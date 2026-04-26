/**
 * LOAD TESTING - rest-book-get API
 * Goal: Validate system behaviour under expected normal production load.
 * Scenario: Ramp up to 50 VUs over 1 min, hold for 3 mins, ramp down.
 * Thresholds: 95% of requests < 2000ms, error rate < 1%.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

const BASE_URL = 'https://restful-booker.herokuapp.com';

// Custom metrics
const responseTimeTrend = new Trend('response_time_ms', true);
const errorRate = new Rate('error_rate');
const requestCount = new Counter('total_requests');

export const options = {
    stages: [
        { duration: '1m', target: 50 },  // Ramp up to 50 VUs
        { duration: '3m', target: 50 },  // Hold at 50 VUs
        { duration: '1m', target: 0 },   // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'],  // 95% requests under 2s
        error_rate: ['rate<0.01'],           // Error rate < 1%
        http_req_failed: ['rate<0.01'],
    },
};

function getAuthToken(): string {
    const res = http.post(`${BASE_URL}/auth`, JSON.stringify({
        username: 'admin',
        password: 'password123',
    }), {
        headers: { 'Content-Type': 'application/json' },
    });
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
        'GET /booking - status 200': (r) => r.status === 200,
        'GET /booking - response not empty': (r) => (r.json() as unknown[]).length > 0,
    });

    sleep(1);

    // 2. GET single booking
    const getOneRes = http.get(`${BASE_URL}/booking/1`, { headers });
    responseTimeTrend.add(getOneRes.timings.duration);
    requestCount.add(1);
    errorRate.add(getOneRes.status !== 200);
    check(getOneRes, {
        'GET /booking/1 - status 200': (r) => r.status === 200,
        'GET /booking/1 - has firstname': (r) => (r.json() as { firstname?: string }).firstname !== undefined,
    });

    sleep(1);

    // 3. POST create booking
    const createRes = http.post(`${BASE_URL}/booking`, JSON.stringify({
        firstname: 'Load',
        lastname: 'Test',
        totalprice: 100,
        depositpaid: true,
        bookingdates: { checkin: '2024-01-01', checkout: '2024-12-31' },
        additionalneeds: 'Breakfast',
    }), { headers });
    responseTimeTrend.add(createRes.timings.duration);
    requestCount.add(1);
    errorRate.add(createRes.status !== 200);
    check(createRes, {
        'POST /booking - status 200': (r) => r.status === 200,
        'POST /booking - has bookingid': (r) => (r.json() as { bookingid?: number }).bookingid !== undefined,
    });

    const bookingId = (createRes.json() as { bookingid?: number }).bookingid;

    sleep(1);

    // 4. PUT update booking
    if (bookingId) {
        const updateRes = http.put(`${BASE_URL}/booking/${bookingId}`, JSON.stringify({
            firstname: 'Updated',
            lastname: 'Load',
            totalprice: 200,
            depositpaid: false,
            bookingdates: { checkin: '2024-01-01', checkout: '2024-12-31' },
            additionalneeds: 'Lunch',
        }), {
            headers: { ...headers, Cookie: `token=${token}` },
        });
        responseTimeTrend.add(updateRes.timings.duration);
        requestCount.add(1);
        errorRate.add(updateRes.status !== 200);
        check(updateRes, { 'PUT /booking/:id - status 200': (r) => r.status === 200 });
    }

    sleep(1);
}
