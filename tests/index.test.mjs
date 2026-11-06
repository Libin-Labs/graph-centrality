import test from 'node:test';
import assert from 'node:assert/strict';
import * as lib from '../dist/esm/index.js';
test('undirected degree scores count incident parallel arcs and loops conventionally', () => {
  assert.deepEqual(
    lib.degreeCentrality(3, [
      { from: 0, to: 1 },
      { from: 0, to: 1 },
    ]),
    [1, 1, 0],
  );
});
test('directed degree score counts outgoing edges', () => {
  assert.deepEqual(
    lib.degreeCentrality(
      3,
      [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
      ],
      { directed: true },
    ),
    [1, 0, 0],
  );
});
test('closeness follows reachable-fraction convention on disconnected graphs', () => {
  assert.deepEqual(
    lib.closenessCentrality(4, [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
    ]),
    [4 / 9, 2 / 3, 4 / 9, 0],
  );
});
test('Brandes path betweenness is exact on a four-vertex path', () => {
  assert.deepEqual(
    lib.betweennessCentrality(4, [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
    ]),
    [0, 2, 2, 0],
  );
});
test('diamond graph splits shortest-path dependency and normalized scores', () => {
  const edges = [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 3 },
  ];
  assert.deepEqual(lib.betweennessCentrality(4, edges), [0.5, 0.5, 0.5, 0.5]);
  assert.deepEqual(lib.betweennessCentrality(4, edges, { normalized: true }), [
    1 / 6,
    1 / 6,
    1 / 6,
    1 / 6,
  ]);
});
test('Brandes path-count accumulation remains finite beyond Number.MAX_VALUE', () => {
  const edges = Array.from({ length: 10_000 }, (_, i) => ({
    from: Math.floor(i / 10),
    to: Math.floor(i / 10) + 1,
  }));
  const scores = lib.betweennessCentrality(1_001, edges, { directed: true, maxWork: 6_000_000 });
  assert.ok(scores.every(Number.isFinite));
  assert.ok(scores[500] > 0);
});
test('invalid graph and work limits are explicit', () => {
  assert.throws(() => lib.closenessCentrality(0, []), RangeError);
  assert.throws(() => lib.betweennessCentrality(3, [{ from: 0, to: 3 }]), RangeError);
  assert.throws(
    () => lib.betweennessCentrality(4, [{ from: 0, to: 1 }], { maxWork: 1 }),
    RangeError,
  );
});
