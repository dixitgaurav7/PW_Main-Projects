/**
 * CORE WEB VITALS — Directory Page
 * URL: /web/index.php/directory/viewDirectory
 */

import { browser } from 'k6/browser';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { loginOrangeHRM, collectCWV, BASE_URL } from './cwv-helpers';

const lcpMetric  = new Trend('cwv_lcp_directory',  true);
const fcpMetric  = new Trend('cwv_fcp_directory',  true);
const clsMetric  = new Trend('cwv_cls_directory',  true);
const ttfbMetric = new Trend('cwv_ttfb_directory', true);
const loadMetric = new Trend('cwv_load_directory', true);
const errorRate  = new Rate('cwv_error_directory');

export const options = {
    scenarios: {
        cwv_directory: {
            executor: 'constant-vus',
            vus: 2,
            duration: '1m',
            options: { browser: { type: 'chromium' } },
        },
    },
    thresholds: {
        cwv_lcp_directory:  ['p(75)<2500'],
        cwv_fcp_directory:  ['p(75)<1800'],
        cwv_cls_directory:  ['p(75)<0.1'],
        cwv_ttfb_directory: ['p(75)<800'],
        cwv_error_directory:['rate<0.05'],
    },
};

export default async function () {
    const page = await browser.newPage();
    try {
        await loginOrangeHRM(page);
        const cwv = await collectCWV(page, `${BASE_URL}/web/index.php/directory/viewDirectory`);

        lcpMetric.add(cwv.lcp);
        fcpMetric.add(cwv.fcp);
        clsMetric.add(cwv.cls);
        ttfbMetric.add(cwv.ttfb);
        loadMetric.add(cwv.load);

        check(cwv, {
            'Directory LCP < 2500ms': (v) => v.lcp < 2500,
            'Directory FCP < 1800ms': (v) => v.fcp < 1800,
            'Directory CLS < 0.1':    (v) => v.cls < 0.1,
            'Directory TTFB < 800ms': (v) => v.ttfb < 800,
        });

        errorRate.add(cwv.load === 0);
    } finally {
        await page.close();
    }
    sleep(1);
}
