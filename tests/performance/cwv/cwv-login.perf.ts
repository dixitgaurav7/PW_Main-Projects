/**
 * CORE WEB VITALS — Login Page
 * URL: /web/index.php/auth/login
 *
 * Measures: LCP, FCP, CLS, TTFB for the Login page (no auth required).
 * k6 browser API collects real browser performance metrics.
 */

import { browser } from 'k6/browser';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const BASE_URL = 'https://opensource-demo.orangehrmlive.com';

// Custom CWV metrics
const lcpMetric   = new Trend('cwv_lcp_login',   true);
const fcpMetric   = new Trend('cwv_fcp_login',   true);
const clsMetric   = new Trend('cwv_cls_login',   true);
const ttfbMetric  = new Trend('cwv_ttfb_login',  true);
const loadMetric  = new Trend('cwv_load_login',  true);
const errorRate   = new Rate('cwv_error_login');

export const options = {
    scenarios: {
        cwv_login: {
            executor: 'constant-vus',
            vus: 3,
            duration: '1m',
            options: { browser: { type: 'chromium' } },
        },
    },
    thresholds: {
        cwv_lcp_login:  ['p(75)<2500'],   // Google "Good" LCP threshold
        cwv_fcp_login:  ['p(75)<1800'],   // Google "Good" FCP threshold
        cwv_cls_login:  ['p(75)<0.1'],    // Google "Good" CLS threshold
        cwv_ttfb_login: ['p(75)<800'],    // Good TTFB threshold
        cwv_error_login:['rate<0.05'],
    },
};

export default async function () {
    const page = await browser.newPage();
    try {
        // Navigate to Login page
        const response = await page.goto(`${BASE_URL}/web/index.php/auth/login`, {
            waitUntil: 'networkidle',
            timeout: 30000,
        });

        const status = response?.status() ?? 0;
        errorRate.add(status !== 200);

        check(page, { 'Login page loaded': () => status === 200 });

        // Collect Core Web Vitals via PerformanceObserver
        const cwv = await page.evaluate(() => {
            return new Promise<{lcp: number; fcp: number; cls: number; ttfb: number; load: number}>((resolve) => {
                let lcp = 0, fcp = 0, cls = 0;

                const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
                const ttfb = navEntry ? navEntry.responseStart - navEntry.requestStart : 0;
                const load = navEntry ? navEntry.loadEventEnd - navEntry.startTime : 0;

                const paintEntries = performance.getEntriesByType('paint');
                paintEntries.forEach(e => {
                    if (e.name === 'first-contentful-paint') fcp = e.startTime;
                });

                new PerformanceObserver(list => {
                    list.getEntries().forEach(e => { lcp = e.startTime; });
                }).observe({ type: 'largest-contentful-paint', buffered: true });

                new PerformanceObserver(list => {
                    list.getEntries().forEach((e: any) => { cls += e.value; });
                }).observe({ type: 'layout-shift', buffered: true });

                setTimeout(() => resolve({ lcp, fcp, cls, ttfb, load }), 2000);
            });
        });

        lcpMetric.add(cwv.lcp);
        fcpMetric.add(cwv.fcp);
        clsMetric.add(cwv.cls);
        ttfbMetric.add(cwv.ttfb);
        loadMetric.add(cwv.load);

        check(cwv, {
            'Login LCP < 2500ms': (v) => v.lcp < 2500,
            'Login FCP < 1800ms': (v) => v.fcp < 1800,
            'Login CLS < 0.1':    (v) => v.cls < 0.1,
            'Login TTFB < 800ms': (v) => v.ttfb < 800,
        });

    } finally {
        await page.close();
    }
    sleep(1);
}
