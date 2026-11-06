export interface CentralityOptions {
  directed?: boolean;
  normalized?: boolean;
  maxWork?: number;
}
export interface CentralityEdge {
  from: number;
  to: number;
}
type Arc = { to: number };
const prepare = (n: number, edges: readonly CentralityEdge[], directed: boolean) => {
  if (!Number.isSafeInteger(n) || n < 1 || n > 2_000) throw new RangeError('Invalid vertexCount');
  if (!Array.isArray(edges) || edges.length > 100_000) throw new RangeError('Invalid edges');
  const adjacency: Arc[][] = Array.from({ length: n }, () => []);
  for (const edge of edges) {
    if (!edge || typeof edge !== 'object') throw new RangeError('Invalid edge');
    const { from, to } = edge;
    if (
      !Number.isSafeInteger(from) ||
      !Number.isSafeInteger(to) ||
      from < 0 ||
      to < 0 ||
      from >= n ||
      to >= n
    )
      throw new RangeError('Edge endpoint out of range');
    adjacency[from]!.push({ to });
    if (!directed) adjacency[to]!.push({ to: from });
  }
  return adjacency;
};
const workLimit = (maxWork: number | undefined) => {
  const value = maxWork === undefined ? 10_000_000 : maxWork;
  if (!Number.isSafeInteger(value) || value < 1 || value > 100_000_000)
    throw new RangeError('Invalid maxWork');
  return value;
};

export function degreeCentrality(
  vertexCount: number,
  edges: readonly CentralityEdge[],
  options: CentralityOptions = {},
): number[] {
  if (!options || typeof options !== 'object') throw new RangeError('Invalid options');
  if (options.directed !== undefined && typeof options.directed !== 'boolean')
    throw new RangeError('directed must be boolean');
  const adjacency = prepare(vertexCount, edges, options.directed ?? false);
  workLimit(options.maxWork);
  return adjacency.map((arcs) => arcs.length / (vertexCount - 1 || 1));
}

export function closenessCentrality(
  vertexCount: number,
  edges: readonly CentralityEdge[],
  options: CentralityOptions = {},
): number[] {
  if (!options || typeof options !== 'object') throw new RangeError('Invalid options');
  if (options.directed !== undefined && typeof options.directed !== 'boolean')
    throw new RangeError('directed must be boolean');
  const adjacency = prepare(vertexCount, edges, options.directed ?? false);
  const maxWork = workLimit(options.maxWork);
  let work = 0;
  return adjacency.map((_, source) => {
    const distance = new Int32Array(vertexCount).fill(-1);
    distance[source] = 0;
    const queue = [source];
    let sum = 0;
    for (let head = 0; head < queue.length; head++) {
      const node = queue[head]!;
      for (const { to } of adjacency[node]!) {
        if (++work > maxWork) throw new RangeError('Work limit exceeded');
        if (distance[to] === -1) {
          distance[to] = distance[node]! + 1;
          sum += distance[to]!;
          queue.push(to);
        }
      }
    }
    const reached = queue.length - 1;
    return reached && sum ? (reached / sum) * (reached / (vertexCount - 1 || 1)) : 0;
  });
}

export function betweennessCentrality(
  vertexCount: number,
  edges: readonly CentralityEdge[],
  options: CentralityOptions = {},
): number[] {
  if (!options || typeof options !== 'object') throw new RangeError('Invalid options');
  if (
    (options.directed !== undefined && typeof options.directed !== 'boolean') ||
    (options.normalized !== undefined && typeof options.normalized !== 'boolean')
  )
    throw new RangeError('Boolean options must be booleans');
  const directed = options.directed ?? false;
  const adjacency = prepare(vertexCount, edges, directed);
  const maxWork = workLimit(options.maxWork);
  const centrality = new Float64Array(vertexCount);
  let work = 0;
  for (let source = 0; source < vertexCount; source++) {
    const predecessors: number[][] = Array.from({ length: vertexCount }, () => []);
    const logSigma = new Float64Array(vertexCount).fill(-Infinity);
    const distance = new Int32Array(vertexCount).fill(-1);
    const queue = [source];
    const order: number[] = [];
    logSigma[source] = 0;
    distance[source] = 0;
    for (let head = 0; head < queue.length; head++) {
      const node = queue[head]!;
      order.push(node);
      for (const { to } of adjacency[node]!) {
        if (++work > maxWork) throw new RangeError('Work limit exceeded');
        if (distance[to]! < 0) {
          distance[to] = distance[node]! + 1;
          queue.push(to);
        }
        if (distance[to]! === distance[node]! + 1) {
          const current = logSigma[to]!;
          const incoming = logSigma[node]!;
          const largest = Math.max(current, incoming);
          logSigma[to] = largest + Math.log1p(Math.exp(Math.min(current, incoming) - largest));
          predecessors[to]!.push(node);
        }
      }
    }
    const dependency = new Float64Array(vertexCount);
    for (let i = order.length - 1; i >= 0; i--) {
      const node = order[i]!;
      for (const previous of predecessors[node]!)
        dependency[previous] =
          dependency[previous]! +
          Math.exp(logSigma[previous]! - logSigma[node]!) * (1 + dependency[node]!);
      if (node !== source) centrality[node] = centrality[node]! + dependency[node]!;
    }
  }
  const scale = directed ? 1 : 0.5;
  if (options.normalized) {
    const denominator = vertexCount > 2 ? (vertexCount - 1) * (vertexCount - 2) : 0;
    if (!denominator) return Array(vertexCount).fill(0);
    for (let i = 0; i < vertexCount; i++) centrality[i] = centrality[i]! / denominator;
  } else {
    for (let i = 0; i < vertexCount; i++) centrality[i] = centrality[i]! * scale;
  }
  return Array.from(centrality);
}
