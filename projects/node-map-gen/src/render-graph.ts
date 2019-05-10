import * as os from 'os';
import { MapNode } from './map-graph';

const renderNode = (
  node: MapNode,
  indent: string,
  parent?: MapNode,
): string => {
  const parentStr = parent === undefined ? '<root>' : `(${parent.roomId}) -> `;
  const header = `${indent}${parentStr} node ${node.roomId}`;
  const nextIndent = `${indent}  `;
  const lines = node.children.map(child => renderNode(child, nextIndent, node));

  return header + os.EOL + lines.join(os.EOL);
};

export const renderGraph = (graph: MapNode): string => {
  return renderNode(graph, '');
};
