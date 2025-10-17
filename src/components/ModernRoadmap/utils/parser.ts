/**
 * Parser utility to convert Balsamiq JSON to Modern Roadmap format
 */

import type {
  RoadmapData,
  RoadmapControl,
  RoadmapNodeData,
  ProcessedRoadmap,
  NodeType,
} from '../types';

const COLOR_TYPE_MAP: Record<string, NodeType> = {
  '16776960': 'required', // Yellow - Required
  '4273622': 'required', // Dark Blue - Required (external link)
  '10027263': 'recommended', // Green checkmark - Recommended
  '16770457': 'alternative', // Light orange - Alternative
  '3700253': 'optional', // Gray - Optional
  '10066329': 'optional', // Light gray - Optional
};

/**
 * Parse Balsamiq control color to node type
 */
function getNodeType(control: RoadmapControl): NodeType {
  const color = control.properties?.color;

  if (!color) {
    return 'required';
  }

  return COLOR_TYPE_MAP[color] || 'required';
}

/**
 * Extract text from control
 */
function extractText(control: RoadmapControl): string {
  if (control.properties?.text) {
    return control.properties.text;
  }

  // Check children for Label controls
  if (control.children?.controls?.control) {
    const labelControl = control.children.controls.control.find(
      (c) => c.typeID === 'Label'
    );
    if (labelControl?.properties?.text) {
      return labelControl.properties.text;
    }
  }

  return '';
}

/**
 * Parse a single control into a node
 */
function parseControl(control: RoadmapControl): RoadmapNodeData | null {
  // Only process groups with controlName
  if (control.typeID !== '__group__' || !control.properties?.controlName) {
    return null;
  }

  const controlName = control.properties.controlName;
  const text = extractText(control);

  if (!text) {
    return null;
  }

  const x =
    typeof control.x === 'string' ? parseInt(control.x, 10) : control.x || 0;
  const y =
    typeof control.y === 'string' ? parseInt(control.y, 10) : control.y || 0;
  const w =
    typeof control.w === 'string' ? parseInt(control.w, 10) : control.w || 200;
  const h =
    typeof control.h === 'string' ? parseInt(control.h, 10) : control.h || 50;

  return {
    id: control.ID,
    title: text,
    type: getNodeType(control),
    groupId: controlName,
    position: { x, y },
    size: { width: w, height: h },
    isDone: false,
  };
}

/**
 * Detect connections between nodes based on proximity and arrows
 */
function detectConnections(
  nodes: RoadmapNodeData[],
  controls: RoadmapControl[]
): Array<{ from: string; to: string }> {
  const connections: Array<{ from: string; to: string }> = [];

  // Find arrow controls
  const arrows = controls.filter((c) => c.typeID === 'Arrow');

  // For now, we'll use a simple proximity-based connection
  // This can be enhanced to parse arrow p0 and p2 coordinates

  nodes.forEach((node, idx) => {
    // Connect to next nodes in a flow (basic heuristic)
    const nextNodes = nodes.filter((n, i) => {
      if (i <= idx) return false;

      // Check if node is below or to the right
      const isBelow = n.position.y > node.position.y + node.size.height;
      const isNearby = Math.abs(n.position.x - node.position.x) < 300;

      return isBelow && isNearby;
    });

    // Connect to the closest next node
    if (nextNodes.length > 0) {
      nextNodes.slice(0, 2).forEach((nextNode) => {
        connections.push({
          from: node.id,
          to: nextNode.id,
        });
      });
    }
  });

  return connections;
}

/**
 * Main parser function to convert Balsamiq JSON to ProcessedRoadmap
 */
export function parseRoadmapData(data: RoadmapData): ProcessedRoadmap {
  const controls = data.mockup.controls.control || [];

  // Parse all nodes
  const nodes = controls
    .map(parseControl)
    .filter((node): node is RoadmapNodeData => node !== null);

  // Detect connections
  const connections = detectConnections(nodes, controls);

  // Calculate canvas dimensions
  const maxX = Math.max(...nodes.map((n) => n.position.x + n.size.width), 0);
  const maxY = Math.max(...nodes.map((n) => n.position.y + n.size.height), 0);

  return {
    nodes,
    connections,
    metadata: {
      width: maxX + 100,
      height: maxY + 100,
    },
  };
}

/**
 * Update node completion status
 */
export function updateNodeCompletion(
  roadmap: ProcessedRoadmap,
  completedNodeIds: string[]
): ProcessedRoadmap {
  return {
    ...roadmap,
    nodes: roadmap.nodes.map((node) => ({
      ...node,
      isDone: completedNodeIds.some((id) => node.groupId.endsWith(`-${id}`)),
    })),
  };
}
