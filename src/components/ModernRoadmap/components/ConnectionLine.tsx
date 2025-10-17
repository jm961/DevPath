/**
 * ConnectionLine - SVG path between nodes
 */

import { type FunctionalComponent } from 'preact';
import type { RoadmapConnection, RoadmapNodeData } from '../types';

interface ConnectionLineProps {
  connection: RoadmapConnection;
  nodes: RoadmapNodeData[];
}

export const ConnectionLine: FunctionalComponent<ConnectionLineProps> = ({
  connection,
  nodes,
}) => {
  const fromNode = nodes.find((n) => n.id === connection.from);
  const toNode = nodes.find((n) => n.id === connection.to);

  if (!fromNode || !toNode) {
    return null;
  }

  const x1 = fromNode.position.x + fromNode.size.width / 2;
  const y1 = fromNode.position.y + fromNode.size.height;
  const x2 = toNode.position.x + toNode.size.width / 2;
  const y2 = toNode.position.y;

  // Create smooth curved path
  const midY = (y1 + y2) / 2;
  const path = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

  const fromDone = fromNode.isDone;
  const toDone = toNode.isDone;
  const bothDone = fromDone && toDone;

  return (
    <path
      d={path}
      stroke={bothDone ? 'rgba(16, 185, 129, 0.5)' : 'rgba(59, 130, 246, 0.3)'}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      className="transition-all duration-300"
      strokeDasharray={connection.type === 'dotted' ? '4 4' : undefined}
      style={{
        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
      }}
    />
  );
};
