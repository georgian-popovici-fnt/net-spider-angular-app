/**
 * Graph theme configuration
 * Centralizes colors, spacing, and visual properties for the entire graph
 */

export const GRAPH_THEME = {
  // Background
  background: {
    color: '#f8fafc',
    gridVisible: false,
    gridColor: '#e2e8f0',
    gridSpacing: 50
  },

  // Group nodes
  group: {
    fillColor: '#f8fafc',
    strokeColor: '#cbd5e1',
    strokeWidth: 2,
    cornerRadius: 8,
    tabFillColor: '#e2e8f0',
    tabStrokeColor: '#cbd5e1',
    tabHeight: 30,
    labelPadding: 8
  },

  // Selection
  selection: {
    color: '#2563eb',
    width: 4,
    shadowBlur: 10,
    shadowColor: 'rgba(37, 99, 235, 0.5)'
  },

  // Canvas
  canvas: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0'
  },

  // Zoom
  zoom: {
    min: 0.1,
    max: 4.0,
    step: 0.1,
    wheelFactor: 1.1
  },

  // Layout
  layout: {
    hierarchical: {
      minimumLayerDistance: 100,
      nodeToNodeDistance: 80,
      orientation: 'top-to-bottom'
    }
  }
};

export const NODE_TYPE_COLORS = {
  router: '#ef4444',
  switch: '#3b82f6',
  server: '#8b5cf6',
  device: '#10b981',
  workstation: '#f59e0b'
};

export const CABLE_TYPE_COLORS = {
  fiber: '#ec4899',
  ethernet: '#3b82f6',
  coaxial: '#f59e0b',
  serial: '#6b7280'
};
