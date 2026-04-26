/**
 * CORE WEB VITALS — My Info Page
 * URL: /web/index.php/pim/viewMyDetails
 */

import { browser } from 'k6/browser';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { loginOrangeHRM, collectCWV, BASE_URL } from './cwv-helpers';

const lcpMetric  = new Trend('cwv_lcp_myinfo',  true);
const fcpMetric  = new Trend('cwv_fcp_myinfo',  true);
const clsMetric  = new Trend('cwv_cls_myinfo',  true);
const ttfbMetric = new Trend('cwv_ttfb_myinfo', true);
const loadMetric = new Trend('cwv_load_myinfo', true);
const errorRate  = new Rate('cwv_error_myinfo');

export const options = {
    scenarios: {
        cwv_myinfo: {
            executor: 'constant-vus',
            vus: 2,
            duration: '1m',
            options: { browser: { type: 'chromium' } },
        },
    },
    thresholds: {
        cwv_lcp_myinfo:  ['p(75)<2500'],
        cwv_fcp_myinfo:  ['p(75)<1800'],
        cwv_cls_myinfo:  ['p(75)<0.1'],
        cwv_ttfb_myinfo: ['p(75)<800'],
        cwv_error_myinfo:['rate<0.05'],
    },
};

export default async function () {
    const page = await browser.newPage();
    try {
        await loginOrangeHRM(page);
        const cwv = await collectCWV(page, `${BASE_URL}/web/index.php/pim/viewMyDetails`);

        lcpMetric.add(cwv.lcp);
        fcpMetric.add(cwv.fcp);
        clsMetric.add(cwv.cls);
        ttfbMetric.add(cwv.ttfb);
        loadMetric.add(cwv.load);

        check(cwv, {
            'MyInfo LCP < 2500ms': (v) => v.lcp < 2500,
            'MyInfo FCP < 1800ms': (v) => v.fcp < 1800,
            'MyInfo CLS < 0.1':    (v) => v.cls < 0.1,
            'MyInfo TTFB < 800ms': (v) => v.ttfb < 800,
        });

        errorRate.add(cwv.load === 0);
    } finally {
        await page.close();
    }
    sleep(1);
}
