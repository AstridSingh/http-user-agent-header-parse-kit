import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseUserAgent, parseUserAgentDetailed } from '../src/index.js';

test('parses Chrome on Windows', () => {
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  const r = parseUserAgent(ua);
  assert.equal(r.browser, 'Chrome');
  assert.equal(r.browserVersion, '120.0.0.0');
  assert.equal(r.engine, 'Blink');
  assert.equal(r.os, 'Windows');
  assert.equal(r.osVersion, '10');
});

test('parses Firefox on macOS', () => {
  const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/119.0';
  const r = parseUserAgent(ua);
  assert.equal(r.browser, 'Firefox');
  assert.equal(r.browserVersion, '119.0');
  assert.equal(r.engine, 'Gecko');
  assert.equal(r.os, 'macOS');
  assert.equal(r.osVersion, '10.15');
});

test('detects Edge before Chrome', () => {
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
  const r = parseUserAgent(ua);
  assert.equal(r.browser, 'Edge');
  assert.equal(r.browserVersion, '120.0.0.0');
});

test('detects Opera before Chrome', () => {
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 OPR/105.0.0.0';
  const r = parseUserAgent(ua);
  assert.equal(r.browser, 'Opera');
});

test('parses Safari on iOS', () => {
  const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
  const r = parseUserAgent(ua);
  assert.equal(r.browser, 'Safari');
  assert.equal(r.browserVersion, '17.0');
  assert.equal(r.os, 'iOS');
  assert.equal(r.osVersion, '17.0');
});

test('parses Android Chrome', () => {
  const ua = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
  const r = parseUserAgent(ua);
  assert.equal(r.browser, 'Chrome');
  assert.equal(r.os, 'Android');
  assert.equal(r.osVersion, '13');
});

test('returns nulls for unknown user agent', () => {
  const r = parseUserAgent('curl/8.0.1');
  assert.equal(r.browser, null);
  assert.equal(r.browserVersion, null);
  assert.equal(r.engine, null);
  assert.equal(r.os, null);
  assert.equal(r.osVersion, null);
});

test('detailed parser returns nested structure', () => {
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  const d = parseUserAgentDetailed(ua);
  assert.equal(d.browser.name, 'Chrome');
  assert.equal(d.engine.name, 'Blink');
  assert.equal(d.os.name, 'Windows');
  assert.equal(d.os.version, '10');
});

test('throws TypeError for non-string input', () => {
  assert.throws(() => parseUserAgent(null), TypeError);
  assert.throws(() => parseUserAgentDetailed(42), TypeError);
});

test('handles empty string', () => {
  const r = parseUserAgent('');
  assert.equal(r.browser, null);
  assert.equal(r.os, null);
});
