/**
 * RoadmapCanvas - Main canvas component with zoom/pan
 */

import { type FunctionalComponent } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';
import type { ProcessedRoadmap } from '../types';
import { RoadmapNode } from './RoadmapNode';
import { ConnectionLine } from './ConnectionLine';
import { ProgressStats } from './ProgressStats';

interface RoadmapCanvasProps {
  roadmap: ProcessedRoadmap;
  onNodeClick: (nodeId: string) => void;
  onNodeComplete?: (nodeId: string) => void;
}

export const RoadmapCanvas: FunctionalComponent<RoadmapCanvasProps> = ({
  roadmap,
  onNodeClick,
  onNodeComplete,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle wheel zoom
  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.5, scale + delta), 2);
    setScale(newScale);
  };

  // Handle pan
  const handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0 && !(e.target as HTMLElement).closest('.roadmap-node')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Reset view
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [scale]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden rounded-3xl"
      style={{
        background:
          'linear-gradient(135deg, rgba(10, 14, 26, 0.9) 0%, rgba(15, 20, 32, 0.8) 100%)',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Progress Stats Dashboard */}
      <ProgressStats roadmap={roadmap} />

      {/* Zoom Controls */}
      <div className="absolute right-4 top-4 z-50 flex flex-col gap-2">
        <button
          onClick={() => setScale((s) => Math.min(s + 0.1, 2))}
          className="btn-ghost flex h-10 w-10 items-center justify-center text-lg transition-all"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => setScale((s) => Math.max(s - 0.1, 0.5))}
          className="btn-ghost flex h-10 w-10 items-center justify-center text-lg transition-all"
          title="Zoom Out"
        >
          −
        </button>
        <button
          onClick={handleReset}
          className="btn-ghost flex h-10 w-10 items-center justify-center text-sm transition-all"
          title="Reset View"
        >
          ⟲
        </button>
      </div>

      {/* Scale indicator */}
      <div className="absolute bottom-4 right-4 z-50 rounded-full border border-white/10 bg-surface-elevated/80 px-3 py-1.5 text-xs font-semibold backdrop-blur-xl">
        {Math.round(scale * 100)}%
      </div>

      {/* Simple grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${40 * scale}px ${40 * scale}px`,
          backgroundPosition: `${position.x}px ${position.y}px`,
        }}
      />

      {/* Main canvas content */}
      <div
        className="absolute"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
          width: `${roadmap.metadata.width}px`,
          height: `${roadmap.metadata.height}px`,
        }}
      >
        {/* Connection lines (SVG layer) */}
        <svg
          className="pointer-events-none absolute inset-0"
          width={roadmap.metadata.width}
          height={roadmap.metadata.height}
          style={{ overflow: 'visible' }}
        >
          {roadmap.connections.map((connection, idx) => (
            <ConnectionLine
              key={`${connection.from}-${connection.to}-${idx}`}
              connection={connection}
              nodes={roadmap.nodes}
            />
          ))}
        </svg>

        {/* Nodes layer */}
        <div className="relative h-full w-full">
          {roadmap.nodes.map((node) => (
            <RoadmapNode
              key={node.id}
              node={node}
              onClick={onNodeClick}
              onComplete={onNodeComplete}
              scale={scale}
            />
          ))}
        </div>
      </div>

      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-4 z-50 space-y-1 rounded-xl border border-white/10 bg-surface-elevated/60 px-4 py-3 text-xs text-muted backdrop-blur-xl">
        <div>
          <strong>Scroll</strong> to zoom
        </div>
        <div>
          <strong>Drag</strong> to pan
        </div>
        <div>
          <strong>Click</strong> node to view
        </div>
        <div>
          <strong>Right-click</strong> to mark done
        </div>
      </div>
    </div>
  );
};
