import assert from 'node:assert/strict';
import test from 'node:test';
import { getContentSecurityPolicy, getRemotePatterns } from './media-config.mjs';

test('admin remote patterns include known BPA development API hosts', () => {
  const patterns = getRemotePatterns({
    NODE_ENV: 'development',
    NEXT_PUBLIC_API_URL: 'http://localhost:4000/api/v1',
  });

  assert.ok(patterns.some((p) => p.hostname === 'localhost' && p.port === '4000' && p.pathname === '/uploads/**'));
  assert.ok(patterns.some((p) => p.hostname === '127.0.0.1' && p.port === '4000' && p.pathname === '/uploads/**'));
  assert.ok(patterns.some((p) => p.hostname === '10.0.2.2' && p.port === '4000' && p.pathname === '/uploads/**'));
  assert.ok(patterns.some((p) => p.hostname === '192.168.10.111' && p.port === '4000' && p.pathname === '/uploads/**'));
});

test('admin CSP explicitly allows configured API and CDN image origins', () => {
  const csp = getContentSecurityPolicy({
    NODE_ENV: 'production',
    NEXT_PUBLIC_API_URL: 'https://api.example.com/api/v1',
    NEXT_PUBLIC_MEDIA_CDN_URL: 'https://cdn.example.com',
  });

  assert.match(csp, /img-src 'self' data: blob: .*https:\/\/api\.example\.com/);
  assert.match(csp, /img-src 'self' data: blob: .*https:\/\/cdn\.example\.com/);
  assert.doesNotMatch(csp, /img-src 'self' data: blob: .*\*+/);
});
