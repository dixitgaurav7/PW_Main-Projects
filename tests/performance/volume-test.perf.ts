/**
 * VOLUME TESTING - rest-book-get API
 * Goal: Validate the system handles a large VOLUME of data/records correctly.
 *       Unlike load testing (concurrent users), volume testing focuses on data quantity.
 * Scenario: Moderate VUs but each iteration creates, queries, and processes
 *           large data sets (bulk creates, filtered queries, pagination simulation).
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

const BASE_URL = 'https://restful-booker.herokuapp.com';

const responseTimeTrend = new Trend('volume_response_time_ms', true);
const errorRate = new Rate('volume_error_rate');
const requestCount = new Counter('volume_total_requests');
const createdCount = new Counter('volume_bookings_created');

export const options = {
    stages: [
        { duration: '1m',  target: 20 },  // Ramp up
        { duration: '5m',  target: 20 },  // Sustained volume period
        { duration: '1m',  target: 0  },  // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<3000'],
        volume_error_rate: ['rate<0.02'],
        http_req_failed: ['rate<0.02'],
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

    // 1. Bulk create 5 bookings per VU iteration (simulates high data volume)
    const createdIds: number[] = [];
    for (let i = 0; i < 5; i++) {
        const createRes = http.post(`${BASE_URL}/booking`, JSON.stringify({
            firstname: `Volume${i}`,
            lastname: `Test${i}`,
            totalprice: 100 + i * 50,
            depositpaid: i % 2 === 0,
            bookingdates: {
                checkin: `2024-0${(i % 9) + 1}-01`,
                checkout: `2024-0${(i % 9) + 1}-15`,
            },
            additionalneeds: i % 2 === 0 ? 'Breakfast' : 'Dinner',
        }), { headers });

        responseTimeTrend.add(createRes.timings.duration);
        requestCount.add(1);
        errorRate.add(createRes.status !== 200);
        check(createRes, { [`VOLUME POST /booking [${i}] - status 200`]: (r) => r.status === 200 });

        const id = (createRes.json() as { bookingid?: number }).bookingid;
        if (id) {
            createdIds.push(id);
            createdCount.add(1);
        }
        sleep(0.2);
    }

    // 2. GET all bookings - verify the system handles large result sets
    const getAllRes = http.get(`${BASE_URL}/booking`, { headers });
    responseTimeTrend.add(getAllRes.timings.duration);
    requestCount.add(1);
    errorRate.add(getAllRes.status !== 200);
    check(getAllRes, {
        'VOLUME GET /booking - status 200': (r) => r.status === 200,
        'VOLUME GET /booking - large response': (r) => (r.json() as unknown[]).length > 0,
    });

    sleep(1);

    // 3. GET with firstname filter - simulates filtered queries on large dataset
    const filterRes = http.get(`${BASE_URL}/booking?firstname=Volume0`, { headers });
    responseTimeTrend.add(filterRes.timings.duration);
    requestCount.add(1);
    errorRate.add(filterRes.status !== 200);
    check(filterRes, {
        'VOLUME GET /booking?firstname= - status 200': (r) => r.status === 200,
    });

    sleep(1);

    // 4. GET with date filter
    const dateFilterRes = http.get(`${BASE_URL}/booking?checkin=2024-01-01`, { headers });
    responseTimeTrend.add(dateFilterRes.timings.duration);
    requestCount.add(1);
    errorRate.add(dateFilterRes.status !== 200);
    check(dateFilterRes, {
        'VOLUME GET /booking?checkin= - status 200': (r) => r.status === 200,
    });

    sleep(1);

    // 5. Clean up all created bookings
    for (const id of createdIds) {
        const del = http.del(`${BASE_URL}/booking/${id}`, null, {
            headers: { ...headers, Cookie: `token=${token}` },
        });
        requestCount.add(1);
        errorRate.add(del.status !== 201);
        check(del, { 'VOLUME DELETE /booking/:id - status 201': (r) => r.status === 201 });
        sleep(0.1);
    }

    sleep(1);
}
