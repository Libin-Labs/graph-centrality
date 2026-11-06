# @lp-labs/graph-centrality

Unweighted degree, reachable-fraction closeness, and Brandes betweenness centrality. Zero runtime and peer dependencies. MIT. Node.js 18+; ES2022-compatible browser runtimes. No browser globals are accessed at import.

## Install

```sh
npm install @lp-labs/graph-centrality
```

## Quick start

```js
import { betweennessCentrality } from '@lp-labs/graph-centrality';
console.log(
  betweennessCentrality(3, [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
  ]),
);
```

Use the named ESM imports shown above. CommonJS uses `const { degreeCentrality } = require('@lp-labs/graph-centrality');`. Both formats ship declarations.

## Public API and customization

Runtime exports: `degreeCentrality, closenessCentrality, betweennessCentrality`.

Public signatures: `degreeCentrality(vertexCount: number, edges: readonly CentralityEdge[], options?: CentralityOptions): number[]; closenessCentrality(vertexCount: number, edges: readonly CentralityEdge[], options?: CentralityOptions): number[]; betweennessCentrality(vertexCount: number, edges: readonly CentralityEdge[], options?: CentralityOptions): number[]`.

Types: `CentralityEdge = { from: number; to: number }`; `CentralityOptions = { directed?: boolean; normalized?: boolean; maxWork?: number }`. `directed` defaults to `false`; `normalized` affects betweenness only; `maxWork` defaults to 10,000,000.

Degree counts outgoing arcs in directed mode (otherwise incident incidences); closeness uses reachableCount / distanceSum × reachableCount/(V−1); betweenness counts shortest paths with equal-path dependency splitting. Normalization is optional for betweenness. All graph vertices are integer indices from `0` to `vertexCount - 1`; edges are copied into algorithm-owned structures. Options are per call; no global configuration.

## Errors, ownership and limits

Degree is O(E); closeness and Brandes are O(V(V+E)) and bounded by maxWork (default 10,000,000 arc scans, maximum 100,000,000), V≤2,000 and E≤100,000. Unweighted only; no PageRank. Invalid vertex counts, endpoints, edge shapes, option values, work exhaustion, and impossible numeric results raise `RangeError`. Results are fresh arrays/objects; input arrays are not mutated.

Synchronous algorithms are bounded by stated input/work limits, not cancellable or real-time. Validation does not sandbox hostile getters, proxies, or callbacks. Finite floating-point behavior applies where weights are used. No I/O, network, persistence, or cryptographic guarantees.

## Development

```sh
npm ci --offline
npm run build
npm run typecheck
npm test
npm run format:check
```

Strict TypeScript NodeNext builds produce ESM, CommonJS, and declarations. Installed ESM/CommonJS consumer checks and seeded or exhaustive reference-oracle tests are included. Only TypeScript and Prettier are development dependencies.

## Support

If this library is useful to you, consider supporting its maintenance with a [donation via PayPal](https://www.paypal.me/LibinPrasanth).

## Author

Created by [Libin Prasanth](https://www.linkedin.com/in/libinprasanth/). Connect on LinkedIn for updates and discussion.
