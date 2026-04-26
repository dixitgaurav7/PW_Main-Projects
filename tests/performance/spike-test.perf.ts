/**
 * SPIKE TESTING - rest-book-get API
 * Goal: Simulate sudden, extreme traffic bursts and verify the system recovers.
 * Scenario: Instantly spike from 5 to 300 VUs, then drop back. Repeat twice.
 * Thresholds: System must recover within acceptable time after each spike.
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

const BASE_URL = 'https://restful-booker.herokuapp.com';

const responseTimeTrend = new Trend('spike_response_time_ms', true);
const errorRate = new Rate('spike_error_rate');
const requestCount = new Counter('spike_total_requests');

export const options = {
    stages: [
        { duration: '30s', target: 5 },    // Baseline - low traffic
        { duration: '10s', target: 300 },  // SPIKE! Instant jump to 300 VUs
        { duration: '1m',  target: 300 },  // Hold spike for 1 minute
        { duration: '10s', target: 5 },    // Drop back to baseline
        { duration: '1m',  target: 5 },    // Recovery period
        { duration: '10s', target: 300 },  // Second spike
        { duration: '1m',  target: 300 },  // Hold second spike
        { duration: '10s', target: 5 },    // Drop to baseline
        { duration: '30s', target: 0 },    // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<5000'],  // Allow up to 5s under spike
        spike_error_rate: ['rate<0.15'],    // Accept up to 15% error during spike
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

    // Primary read endpoint - most susceptible to spikes
    const getAllRes = http.get(`${BASE_URL}/booking`, { headers });
    responseTimeTrend.add(getAllRes.timings.duration);
    requestCount.add(1);
    errorRate.add(getAllRes.status !== 200);
    check(getAllRes, {
        'SPIKE GET /booking - status 200': (r) => r.status === 200,
        'SPIKE GET /booking - responded': (r) => r.status !== 0,
    });

    sleep(0.3);

    // Write under spike - tests DB write under high concurrency
    const createRes = http.post(`${BASE_URL}/booking`, JSON.stringify({
        firstname: 'Spike',
        lastname: 'User',
        totalprice: 999,
        depositpaid: false,
        bookingdates: { checkin: '2025-01-01', checkout: '2025-01-10' },
        additionalneeds: 'WiFi',
    }), { headers });
    responseTimeTrend.add(createRes.timings.duration);
    requestCount.add(1);
    errorRate.add(createRes.status !== 200);
    check(createRes, {
        'SPIKE POST /booking - status 200': (r) => r.status === 200,
    });

    // Clean up created booking
    const bookingId = (createRes.json() as { bookingid?: number }).bookingid;
    if (bookingId) {
        const token = getAuthToken();
        http.del(`${BASE_URL}/booking/${bookingId}`, null, {
            headers: { ...headers, Cookie: `token=${token}` },
        });
    }

    sleep(0.3);
}
