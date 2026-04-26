/**
 * SCALABILITY TESTING - rest-book-get API
 * Goal: Measure how performance scales as VUs increase step by step.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

const BASE_URL = 'https://restful-booker.herokuapp.com';

const responseTimeTrend = new Trend('scalability_response_time_ms', true);
const errorRate = new Rate('scalability_error_rate');
const requestCount = new Counter('scalability_total_requests');

export const options = {
    stages: [
        { duration: '30s', target: 10  }, { duration: '1m', target: 10  },
        { duration: '30s', target: 25  }, { duration: '1m', target: 25  },
        { duration: '30s', target: 50  }, { duration: '1m', target: 50  },
        { duration: '30s', target: 100 }, { duration: '1m', target: 100 },
        { duration: '30s', target: 150 }, { duration: '1m', target: 150 },
        { duration: '30s', target: 200 }, { duration: '1m', target: 200 },
        { duration: '1m',  target: 0   },
    ],
    thresholds: {
        http_req_duration: ['p(95)<4000'],
        scalability_error_rate: ['rate<0.05'],
        http_req_failed: ['rate<0.05'],
    },
};

function getAuthToken(): string {
    const res = http.post(`${BASE_URL}/auth`, JSON.stringify({
        username: 'admin',
        password: 'password123',
    }), { headers: { 'Content-Type': 'application/json' } });
    return ((res.json() as { token?: string }).token) ?? '';
}

export default function () {
    const token = getAuthToken();
    const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };

    // GET all bookings
    const getAllRes = http.get(`${BASE_URL}/booking`, { headers });
    responseTimeTrend.add(getAllRes.timings.duration);
    requestCount.add(1);
    errorRate.add(getAllRes.status !== 200);
    check(getAllRes, {
        'SCALE GET /booking - status 200': (r) => r.status === 200,
        'SCALE GET /booking - under 4s': (r) => r.timings.duration < 4000,
    });

    sleep(1);

    // POST create booking
    const createRes = http.post(`${BASE_URL}/booking`, JSON.stringify({
        firstname: 'Scale', lastname: 'Test', totalprice: 750, depositpaid: true,
        bookingdates: { checkin: '2025-05-01', checkout: '2025-05-10' },
        additionalneeds: 'Gym Access',
    }), { headers });
    responseTimeTrend.add(createRes.timings.duration);
    requestCount.add(1);
    errorRate.add(createRes.status !== 200);
    check(createRes, { 'SCALE POST /booking - status 200': (r) => r.status === 200 });

    const bookingId = (createRes.json() as { bookingid?: number }).bookingid;
    sleep(1);

    // PUT update then DELETE to clean up
    if (bookingId) {
        http.put(`${BASE_URL}/booking/${bookingId}`, JSON.stringify({
            firstname: 'ScaleUpd', lastname: 'Test', totalprice: 800, depositpaid: true,
            bookingdates: { checkin: '2025-05-01', checkout: '2025-05-15' },
            additionalneeds: 'Pool',
        }), { headers: { ...headers, Cookie: `token=${token}` } });
        sleep(0.5);
        const del = http.del(`${BASE_URL}/booking/${bookingId}`, null, {
            headers: { ...headers, Cookie: `token=${token}` },
        });
        requestCount.add(1);
        errorRate.add(del.status !== 201);
        check(del, { 'SCALE DELETE /booking/:id - status 201': (r) => r.status === 201 });
    }

    sleep(1);
}
