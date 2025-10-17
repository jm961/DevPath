/**
 * ProgressStats - Dashboard showing roadmap completion progress
 */

import { type FunctionalComponent } from 'preact';
import { useMemo } from 'preact/hooks';
import type { ProcessedRoadmap } from '../types';

interface ProgressStatsProps {
  roadmap: ProcessedRoadmap;
}

export const ProgressStats: FunctionalComponent<ProgressStatsProps> = ({
  roadmap,
}) => {
  const stats = useMemo(() => {
    const total = roadmap.nodes.length;
    const completed = roadmap.nodes.filter((n) => n.isDone).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const byType = {
      required: {
        total: roadmap.nodes.filter((n) => n.type === 'required').length,
        completed: roadmap.nodes.filter(
          (n) => n.type === 'required' && n.isDone
        ).length,
      },
      recommended: {
        total: roadmap.nodes.filter((n) => n.type === 'recommended').length,
        completed: roadmap.nodes.filter(
          (n) => n.type === 'recommended' && n.isDone
        ).length,
      },
      alternative: {
        total: roadmap.nodes.filter((n) => n.type === 'alternative').length,
        completed: roadmap.nodes.filter(
          (n) => n.type === 'alternative' && n.isDone
        ).length,
      },
      optional: {
        total: roadmap.nodes.filter((n) => n.type === 'optional').length,
        completed: roadmap.nodes.filter(
          (n) => n.type === 'optional' && n.isDone
        ).length,
      },
    };

    return {
      total,
      completed,
      percentage,
      byType,
    };
  }, [roadmap.nodes]);

  return (
    <div className="absolute left-4 top-4 z-50 flex flex-col gap-3">
      {/* Main progress card */}
      <div
        className="card min-w-[240px] p-4 backdrop-blur-2xl"
        style={{
          background:
            'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
          boxShadow:
            '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
        }}
      >
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-text">
            Your Progress
          </h3>
          <div className="text-2xl">🎯</div>
        </div>

        {/* Circular progress */}
        <div className="mb-4 flex items-center justify-center">
          <div className="relative h-24 w-24">
            <svg className="h-full w-full -rotate-90 transform">
              {/* Background circle */}
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="url(#progress-gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${
                  2 * Math.PI * 40 * (1 - stats.percentage / 100)
                }`}
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))',
                }}
              />
              <defs>
                <linearGradient
                  id="progress-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
            {/* Percentage text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="gradient-text text-2xl font-black">
                {stats.percentage}%
              </span>
              <span className="text-[10px] text-muted">Complete</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted">
            <span>Completed</span>
            <span className="font-bold text-success">
              {stats.completed} / {stats.total}
            </span>
          </div>

          {/* Type breakdown */}
          <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
            {stats.byType.required.total > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="text-base">⚡</span>
                  <span className="text-muted">Required</span>
                </span>
                <span className="font-semibold text-primary">
                  {stats.byType.required.completed}/
                  {stats.byType.required.total}
                </span>
              </div>
            )}
            {stats.byType.recommended.total > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="text-base">⭐</span>
                  <span className="text-muted">Top Pick</span>
                </span>
                <span className="font-semibold text-success">
                  {stats.byType.recommended.completed}/
                  {stats.byType.recommended.total}
                </span>
              </div>
            )}
            {stats.byType.alternative.total > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="text-base">🔄</span>
                  <span className="text-muted">Alternative</span>
                </span>
                <span className="font-semibold text-warning">
                  {stats.byType.alternative.completed}/
                  {stats.byType.alternative.total}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Achievement message */}
        {stats.percentage === 100 && (
          <div className="mt-4 animate-scale-in rounded-xl bg-gradient-to-r from-success/20 to-primary/20 p-3 text-center">
            <div className="mb-1 text-2xl">🎉</div>
            <p className="text-xs font-bold text-success">Roadmap Complete!</p>
          </div>
        )}
        {stats.percentage >= 50 && stats.percentage < 100 && (
          <div className="mt-4 animate-scale-in rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 p-3 text-center">
            <div className="mb-1 text-xl">🔥</div>
            <p className="text-xs font-bold text-primary">Halfway there!</p>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex flex-col gap-2">
        <button
          className="btn-ghost flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold"
          onClick={() => {
            const firstIncomplete = document.querySelector(
              '.roadmap-node:not([data-done="true"])'
            );
            firstIncomplete?.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }}
        >
          <span>🎯</span>
          <span>Next Task</span>
        </button>
      </div>
    </div>
  );
};
