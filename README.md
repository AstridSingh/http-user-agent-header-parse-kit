# http-user-agent-header-parse-kit

Parses an HTTP User-Agent header string into structured browser, version, engine, and operating system fields.

```js
import { parseUserAgent } from 'http-user-agent-header-parse-kit';

const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

console.log(parseUserAgent(ua));
// {
//   browser: 'Chrome',
//   browserVersion: '120.0.0.0',
//   engine: 'Blink',
//   os: 'Windows',
//   osVersion: '10'
// }
```

For nested output use `parseUserAgentDetailed`, which returns `{ browser: { name, version }, engine: { name, version }, os: { name, version } }`.

## Why this exists

User-Agent strings are not a standard format. They are a historical accumulation of tokens, and browsers deliberately impersonate each other. A naive first-match parser will classify Edge as Chrome, Opera as Chrome, and Chrome on iOS as Safari. This library exists to apply a fixed, documented precedence order so that the same input always produces the same classification. The trade-off is that the parser is heuristic: it recognises the tokens that the major browsers actually emit today, not every token that has ever existed.

## The awkward edge

Engine versions are not reliably present in the User-Agent string. Chrome reports `AppleWebKit/537.36` but not its own Blink version. This library therefore sets `engine` to the engine name and leaves `engine.version` as `null` in the detailed output. If you need a version number, use the browser version as a proxy; there is no honest way to extract the engine version from the string alone.

## Performance

The window keeps a bounded buffer, so `push` is constant time and memory does not
grow with the length of the stream. `peak` and `trough` are linear in the window
size, which is the trade that keeps `push` cheap.

