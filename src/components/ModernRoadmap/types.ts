/**
 * Modern Roadmap Renderer Types
 */

export interface RoadmapNodeData {
  id: string;
  title: string;
  type: 'required' | 'recommended' | 'alternative' | 'optional';
  groupId: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  connections?: string[];
  isDone?: boolean;
  metadata?: {
    description?: string;
    links?: string[];
    tags?: string[];
  };
}

export interface RoadmapConnection {
  from: string;
  to: string;
  type?: 'solid' | 'dotted' | 'dashed';
}

export interface RoadmapData {
  mockup: {
    controls: {
      control: RoadmapControl[];
    };
  };
}

export interface RoadmapControl {
  ID: string;
  typeID: string;
  properties?: {
    controlName?: string;
    text?: string;
    color?: string;
  };
  x?: string | number;
  y?: string | number;
  w?: string | number;
  h?: string | number;
  measuredW?: string | number;
  measuredH?: string | number;
  children?: {
    controls: {
      control: RoadmapControl[];
    };
  };
}

export interface ProcessedRoadmap {
  nodes: RoadmapNodeData[];
  connections: RoadmapConnection[];
  metadata: {
    width: number;
    height: number;
  };
}

export type NodeType = 'required' | 'recommended' | 'alternative' | 'optional';

export interface RoadmapRendererProps {
  resourceId: string;
  resourceType: 'roadmap' | 'best-practice';
  jsonUrl: string;
  onNodeClick?: (nodeId: string) => void;
  onNodeComplete?: (nodeId: string) => void;
  completedNodes?: string[];
}
