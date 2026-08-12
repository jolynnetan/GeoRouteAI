// Shared graph types and helpers — imported by both the runtime OSM loader and the geoai engine.

import type { Pos } from '@/types';

export interface GraphNode { id: string; pos: Pos; }
export interface GraphEdge { to: string; weight: number; }
export interface Graph {
  nodes: GraphNode[];
  adj: Record<string, GraphEdge[]>;
}

export function haversineKm(a: Pos, b: Pos): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function nearestNode(graph: Graph, pos: Pos): string {
  let best = graph.nodes[0]?.id ?? '';
  let bd = Infinity;
  for (const n of graph.nodes) {
    const d = haversineKm(pos, n.pos);
    if (d < bd) { bd = d; best = n.id; }
  }
  return best;
}

export function dijkstra(graph: Graph, startId: string, endId: string): { dist: number; path: string[] } {
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();
  for (const n of graph.nodes) dist[n.id] = Infinity;
  dist[startId] = 0;
  prev[startId] = null;
  const queue: { id: string; d: number }[] = [{ id: startId, d: 0 }];

  while (queue.length > 0) {
    queue.sort((a, b) => a.d - b.d);
    const cur = queue.shift()!;
    if (visited.has(cur.id)) continue;
    visited.add(cur.id);
    if (cur.id === endId) break;
    for (const edge of graph.adj[cur.id] || []) {
      if (visited.has(edge.to)) continue;
      const alt = dist[cur.id] + edge.weight;
      if (alt < dist[edge.to]) {
        dist[edge.to] = alt;
        prev[edge.to] = cur.id;
        queue.push({ id: edge.to, d: alt });
      }
    }
  }
  const path: string[] = [];
  let cur: string | null = endId;
  if (dist[endId] === Infinity) return { dist: Infinity, path: [] };
  while (cur) { path.unshift(cur); cur = prev[cur]; }
  return { dist: dist[endId], path };
}

export function pathToPositions(graph: Graph, ids: string[]): Pos[] {
  return ids.map((id) => graph.nodes.find((n) => n.id === id)!.pos).filter(Boolean);
}
