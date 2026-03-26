/**
 * shh-bomb.js — k6 load test for Shh Me
 *
 * Install: https://k6.io/docs/getting-started/installation/
 * Run:     k6 run tests/load/shh-bomb.js
 * Options: k6 run --vus 50 --duration 2m tests/load/shh-bomb.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const landingDuration = new Trend('landing_duration', true);
const apiHealthDuration = new Trend('api_health_duration', true);

export const options = {
    stages: [
        { duration: '30s', target: 20 },   // ramp up to 20 VUs
        { duration: '1m',  target: 50 },   // hold 50 VUs
        { duration: '30s', target: 100 },  // spike to 100
        { duration: '1m',  target: 100 },  // hold 100 VUs
        { duration: '30s', target: 0 },    // ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],   // 95% of requests under 500ms
        errors: ['rate<0.05'],              // error rate under 5%
        landing_duration: ['p(95)<400'],
        api_health_duration: ['p(95)<200'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'https://shh-me.com';

export default function () {
    // 1. Landing page (EN)
    let res = http.get(`${BASE_URL}/en`);
    landingDuration.add(res.timings.duration);
    check(res, { 'landing 200': (r) => r.status === 200 }) || errorRate.add(1);

    // 2. Landing page (FR)
    res = http.get(`${BASE_URL}/fr`);
    check(res, { 'landing FR 200': (r) => r.status === 200 }) || errorRate.add(1);

    // 3. API health check
    res = http.get(`${BASE_URL}/api/health`);
    apiHealthDuration.add(res.timings.duration);
    check(res, { 'health 200': (r) => r.status === 200 }) || errorRate.add(1);

    // 4. Legal pages
    const legalPages = ['/privacy', '/terms', '/community', '/contact', '/delete-account'];
    for (const page of legalPages) {
        res = http.get(`${BASE_URL}${page}`);
        check(res, { [`${page} 200`]: (r) => r.status === 200 }) || errorRate.add(1);
    }

    // 5. Deep linking endpoints
    res = http.get(`${BASE_URL}/.well-known/apple-app-site-association`);
    check(res, {
        'AASA 200': (r) => r.status === 200,
        'AASA JSON': (r) => r.json('applinks') !== undefined,
    }) || errorRate.add(1);

    res = http.get(`${BASE_URL}/.well-known/assetlinks.json`);
    check(res, {
        'assetlinks 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    // 6. Sitemap
    res = http.get(`${BASE_URL}/sitemap.xml`);
    check(res, { 'sitemap 200': (r) => r.status === 200 }) || errorRate.add(1);

    sleep(1);
}

export function handleSummary(data) {
    const p95 = data.metrics.http_req_duration.values['p(95)'];
    const errRate = data.metrics.errors ? data.metrics.errors.values.rate : 0;

    console.log(`\n=== SHH-BOMB RESULTS ===`);
    console.log(`  p95 latency:  ${p95.toFixed(1)}ms`);
    console.log(`  error rate:   ${(errRate * 100).toFixed(2)}%`);
    console.log(`  total reqs:   ${data.metrics.http_reqs.values.count}`);
    console.log(`========================\n`);

    return {};
}
