import dagre from "@dagrejs/dagre";
import { NODE_W, NODE_H } from "./constants";

export function getLayoutedElements(nodes, edges) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", ranksep: 90, nodesep: 45, marginx: 60, marginy: 60 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach(n => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  // Add edges in source→target order for dagre (child→parent, i.e. lower layer→higher layer)
  edges.forEach(e => g.setEdge(e.source, e.target));

  dagre.layout(g);

  return nodes.map(n => {
    const { x, y } = g.node(n.id);
    return { ...n, position: { x: x - NODE_W / 2, y: y - NODE_H / 2 } };
  });
}
