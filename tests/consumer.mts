import {
  betweennessCentrality,
  closenessCentrality,
  degreeCentrality,
  type CentralityEdge,
  type CentralityOptions,
} from '@lp-labs/graph-centrality';
export type PublicTypes = [CentralityEdge, CentralityOptions];
void degreeCentrality;
void closenessCentrality;
void betweennessCentrality;
// @ts-expect-error public API requires numeric vertex counts
degreeCentrality('invalid', []);
