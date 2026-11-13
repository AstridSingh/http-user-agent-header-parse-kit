// Parses an HTTP User-Agent header string into structured fields.
// The parser is intentionally heuristic and ordered: browsers that embed
// other browsers (Edge, Opera, Chrome on iOS) are checked before their
// engines and parents, because a naive first-match would misclassify them.

const BROWSER_PATTERNS = [
  // Edge (Chromium) must come before Chrome; the Edg/ token is the marker.
  { name: 'Edge', re: /Edg(?:e|A|iOS)?\/([\d.]+)/ },
  // Opera also reports Chrome and Safari.
  { name: 'Opera', re: /(?:OPR|Opera|OPiOS)\/([\d.]+)/ },
  // Samsung Internet reports Chrome.
  { name: 'Samsung Internet', re: /SamsungBrowser\/([\d.]+)/ },
  { name: 'Firefox', re: /(?:Firefox|FxiOS)\/([\d.]+)/ },
  { name: 'Internet Explorer', re: /MSIE ([\d.]+)/ },
  { name: 'Internet Explorer', re: /Trident\/.*rv:([\d.]+)/ },
  // Chrome and Safari must come after the wrappers above.
  { name: 'Chrome', re: /(?:Chrome|CriOS)\/([\d.]+)/ },
  { name: 'Safari', re: /Version\/([\d.]+).*Safari/ },
];

// Engine detection is done separately from browser detection because the
// engine token is stable even when the browser token is missing.
const ENGINE_PATTERNS = [
  { name: 'Blink', re: /Chrome\/|Edg\/|OPR\// },
  { name: 'Gecko', re: /Gecko\/|Firefox\// },
  { name: 'WebKit', re: /AppleWebKit\// },
  { name: 'Trident', re: /Trident\// },
  { name: 'Presto', re: /Presto\// },
];

// OS detection is ordered from most specific to least specific. Windows NT
// versions are mapped to marketing names because that is what callers expect.
// Each matcher returns undefined when the platform token is absent, which lets
// the loop continue to the next candidate.
const OS_PATTERNS = [
  { name: 'Windows', version: (ua) => {
      const m = ua.match(/Windows NT ([\d.]+)/);
      if (!m) return undefined;
      const map = { '10.0': '10', '6.3': '8.1', '6.2': '8', '6.1': '7', '6.0': 'Vista', '5.1': 'XP', '5.0': '2000' };
      return map[m[1]] || m[1];
    } },
  { name: 'Android', version: (ua) => {
      const m = ua.match(/Android ([\d.]+)/);
      return m ? m[1] : undefined;
    } },
  { name: 'iOS', version: (ua) => {
      // iPad on iOS 13+ reports as Macintosh; detect via the touch token.
      if (!/iPhone|iPad|iPod/.test(ua) && !/Macintosh/.test(ua)) return undefined;
      if (!/Mobile\//.test(ua) && !/iPad|iPhone|iPod/.test(ua)) return undefined;
      const m = ua.match(/OS (\d+[_ .]\d+(?:[_ .]\d+)?)/);
      return m ? m[1].replace(/[_ ]/g, '.') : undefined;
    } },
  { name: 'macOS', version: (ua) => {
      const m = ua.match(/Mac OS X (\d+[_ .]\d+(?:[_ .]\d+)?)/);
      return m ? m[1].replace(/[_ ]/g, '.') : undefined;
    } },
  { name: 'Linux', version: (ua) => /Linux/.test(ua) ? null : undefined },
  { name: 'Chrome OS', version: (ua) => {
      const m = ua.match(/CrOS \S+ (\d+[\d.]*)/);
      return m ? m[1] : undefined;
    } },
];

/**
 * Parse a User-Agent string into browser, engine, and OS fields.
 * @param {string} ua
 * @returns {{browser: {name: string|null, version: string|null}, engine: {name: string|null, version: string|null}, os: {name: string|null, version: string|null}}}
 */
export function parseUserAgentDetailed(ua) {
  if (typeof ua !== 'string') {
    throw new TypeError('User-Agent must be a string');
  }

  let browser = { name: null, version: null };
  for (const { name, re } of BROWSER_PATTERNS) {
    const m = ua.match(re);
    if (m) {
      browser = { name, version: m[1] || null };
      break;
    }
  }

  let engine = { name: null, version: null };
  for (const { name, re } of ENGINE_PATTERNS) {
    if (re.test(ua)) {
      engine.name = name;
      // Engine versions are not reliably present in the UA string, so we
      // only populate the name. A caller needing the version should use the
      // browser version as a proxy.
      break;
    }
  }

  let os = { name: null, version: null };
  for (const { name, version } of OS_PATTERNS) {
    const v = version(ua);
    if (v !== undefined) {
      os = { name, version: v };
      break;
    }
  }

  return { browser, engine, os };
}

/**
 * Convenience wrapper returning a flat object.
 * @param {string} ua
 * @returns {{browser: string|null, browserVersion: string|null, engine: string|null, os: string|null, osVersion: string|null}}
 */
export function parseUserAgent(ua) {
  const d = parseUserAgentDetailed(ua);
  return {
    browser: d.browser.name,
    browserVersion: d.browser.version,
    engine: d.engine.name,
    os: d.os.name,
    osVersion: d.os.version,
  };
}
