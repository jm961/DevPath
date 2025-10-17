/**
 * Modern Roadmap Renderer - Main component
 */

import { type FunctionalComponent } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import type { RoadmapRendererProps, ProcessedRoadmap } from './types';
import { parseRoadmapData, updateNodeCompletion } from './utils/parser';
import { RoadmapCanvas } from './components/RoadmapCanvas';
import Spinner from '../Spinner';

export const RoadmapRenderer: FunctionalComponent<RoadmapRendererProps> = ({
  resourceId,
  resourceType,
  jsonUrl,
  onNodeClick,
  onNodeComplete,
  completedNodes = [],
}) => {
  const [roadmap, setRoadmap] = useState<ProcessedRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load and parse roadmap data
  useEffect(() => {
    let mounted = true;

    const loadRoadmap = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(jsonUrl);
        if (!response.ok) {
          throw new Error(`Failed to load roadmap: ${response.statusText}`);
        }

        const data = await response.json();
        const parsedRoadmap = parseRoadmapData(data);

        if (mounted) {
          setRoadmap(parsedRoadmap);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading roadmap:', err);
        if (mounted) {
          setError(
            err instanceof Error ? err.message : 'Failed to load roadmap'
          );
          setLoading(false);
        }
      }
    };

    loadRoadmap();

    return () => {
      mounted = false;
    };
  }, [jsonUrl]);

  // Update completed nodes
  useEffect(() => {
    if (roadmap && completedNodes.length > 0) {
      const updatedRoadmap = updateNodeCompletion(roadmap, completedNodes);
      setRoadmap(updatedRoadmap);
    }
  }, [completedNodes]);

  const handleNodeClick = (nodeId: string) => {
    // Normalize node ID (remove sorting prefix)
    const normalizedId = nodeId.replace(/^\d+-/, '');

    // Dispatch custom event for compatibility with existing system
    window.dispatchEvent(
      new CustomEvent(`${resourceType}.topic.click`, {
        detail: {
          topicId: normalizedId,
          resourceId: resourceId,
          resourceType: resourceType,
        },
      })
    );

    // Call optional callback
    if (onNodeClick) {
      onNodeClick(normalizedId);
    }
  };

  const handleNodeComplete = (nodeId: string) => {
    // Normalize node ID
    const normalizedId = nodeId.replace(/^\d+-/, '');

    // Dispatch custom event for completion
    window.dispatchEvent(
      new CustomEvent(`${resourceType}.topic.toggle`, {
        detail: {
          topicId: normalizedId,
          resourceType: resourceType,
          resourceId: resourceId,
        },
      })
    );

    // Call optional callback
    if (onNodeComplete) {
      onNodeComplete(normalizedId);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-[400px] w-full items-center justify-center rounded-3xl bg-surface">
        <div className="space-y-4 text-center">
          <Spinner />
          <p className="text-sm text-muted">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[400px] w-full items-center justify-center rounded-3xl bg-surface">
        <div className="card max-w-md space-y-4 p-8 text-center">
          <div className="text-4xl text-danger">⚠️</div>
          <h3 className="text-xl font-bold text-danger">
            Failed to Load Roadmap
          </h3>
          <p className="text-sm text-muted">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary mt-4"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return null;
  }

  return (
    <div className="h-full min-h-[600px] w-full">
      <RoadmapCanvas
        roadmap={roadmap}
        onNodeClick={handleNodeClick}
        onNodeComplete={handleNodeComplete}
      />
    </div>
  );
};
