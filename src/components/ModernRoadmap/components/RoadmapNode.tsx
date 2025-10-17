/**
 * RoadmapNode - Individual node component with glassmorphic design
 */

import { type FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import type { RoadmapNodeData } from '../types';

interface RoadmapNodeProps {
  node: RoadmapNodeData;
  onClick: (nodeId: string) => void;
  onComplete?: (nodeId: string) => void;
  scale: number;
}

const NODE_COLORS = {
  required: {
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.3)',
    text: '#60a5fa',
  },
  recommended: {
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.3)',
    text: '#34d399',
  },
  alternative: {
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.3)',
    text: '#fbbf24',
  },
  optional: {
    bg: 'rgba(148, 163, 184, 0.1)',
    border: 'rgba(148, 163, 184, 0.3)',
    text: '#cbd5e1',
  },
};

export const RoadmapNode: FunctionalComponent<RoadmapNodeProps> = ({
  node,
  onClick,
  onComplete,
  scale,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const colors = NODE_COLORS[node.type];

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    onClick(node.groupId);
  };

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onComplete) {
      onComplete(node.groupId);
    }
  };

  const style = {
    left: `${node.position.x}px`,
    top: `${node.position.y}px`,
    width: `${node.size.width}px`,
    minHeight: `${node.size.height}px`,
  };

  const isDone = node.isDone;

  return (
    <div
      className="roadmap-node group absolute cursor-pointer select-none transition-all duration-300"
      style={style}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-node-id={node.id}
      data-group-id={node.groupId}
    >
      {/* Simple, clean card */}
      <div
        className={`
          relative flex h-full items-center justify-center
          rounded-xl border px-4 py-3
          backdrop-blur-sm
          transition-all duration-300
          ${isHovered ? '-translate-y-1 scale-105' : ''}
          ${isDone ? 'opacity-60' : ''}
        `}
        style={{
          background: isDone ? 'rgba(16, 185, 129, 0.15)' : colors.bg,
          borderColor: isDone
            ? 'rgba(16, 185, 129, 0.5)'
            : isHovered
            ? colors.border.replace('0.3', '0.5')
            : colors.border,
          boxShadow: isHovered
            ? `0 8px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px ${colors.border} inset`
            : '0 2px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Done checkmark */}
        {isDone && (
          <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-success shadow-lg">
            <svg
              className="h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}

        {/* Title */}
        <p
          className={`
            text-center font-semibold leading-tight
            transition-colors duration-300
            ${isDone ? 'line-through' : ''}
          `}
          style={{
            color: isDone ? '#10b981' : colors.text,
            fontSize: node.size.width < 150 ? '0.813rem' : '0.938rem',
          }}
        >
          {node.title}
        </p>

        {/* Type indicator on hover */}
        {!isDone && isHovered && (
          <div
            className="absolute -bottom-2 right-2 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{
              background: colors.bg,
              borderColor: colors.border,
              color: colors.text,
              border: `1px solid ${colors.border}`,
            }}
          >
            {node.type === 'required' && 'Required'}
            {node.type === 'recommended' && 'Recommended'}
            {node.type === 'alternative' && 'Alternative'}
            {node.type === 'optional' && 'Optional'}
          </div>
        )}
      </div>
    </div>
  );
};
