/**
 * Shared helpers for OrangeHRM Core Web Vitals tests.
 * - loginOrangeHRM: authenticates and returns the page ready for CWV measurement.
 * - collectCWV: collects LCP, FCP, CLS, TTFB, and page load time via browser APIs.
 */

import { Page } from 'k6/browser';

export const BASE_URL = 'https://opensource-demo.orangehrmlive.com';

export interface CWVResult {
    lcp: number;
    fcp: number;
    cls: number;
    ttfb: number;
    load: number;
}

/** Log in to OrangeHRM and wait for the dashboard to be ready. */
export async function loginOrangeHRM(page: Page): Promise<void> {
    await page.goto(`${BASE_URL}/web/index.php/auth/login`, {
        waitUntil: 'networkidle',
        timeout: 30000,
    });
    await page.locator('input[name="username"]').fill('Admin');
    await page.locator('input[name="password"]').fill('admin123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(`${BASE_URL}/web/index.php/dashboard/index`, { timeout: 30000 });
}

/** Navigate to a URL after login and collect Core Web Vitals. */
export async function collectCWV(page: Page, url: string): Promise<CWVResult> {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    const cwv = await page.evaluate((): Promise<CWVResult> => {
        return new Promise<CWVResult>((resolve) => {
            let lcp = 0, fcp = 0, cls = 0;

            const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            const ttfb = navEntry ? navEntry.responseStart - navEntry.requestStart : 0;
            const load = navEntry ? navEntry.loadEventEnd - navEntry.startTime : 0;

            performance.getEntriesByType('paint').forEach((e) => {
                if (e.name === 'first-contentful-paint') fcp = e.startTime;
            });

            try {
                new PerformanceObserver((list) => {
                    list.getEntries().forEach((e) => { lcp = e.startTime; });
                }).observe({ type: 'largest-contentful-paint', buffered: true });

                new PerformanceObserver((list) => {
                    list.getEntries().forEach((e: any) => { cls += e.value ?? 0; });
                }).observe({ type: 'layout-shift', buffered: true });
            } catch (_) { /* PerformanceObserver may not be available for all metrics */ }

            setTimeout(() => resolve({ lcp, fcp, cls, ttfb, load }), 2500);
        });
    });

    return cwv;
}
