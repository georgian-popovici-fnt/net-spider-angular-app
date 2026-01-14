# Auto Layout & Edge Persistence - Fix Summary

## Problem Identified

The auto layout positions were being saved to the file correctly, but NOT being loaded/applied when the topology was reloaded.

### Root Cause
**localStorage vs File Conflict**: When the app started, it loaded old positions from localStorage. When a saved file with positions was loaded, there was a conflict between:
1. Old positions in localStorage (loaded at app startup)
2. New positions in the saved file (from auto layout)

The code wasn't properly prioritizing the file data over localStorage data.

## Solution Implemented

### 1. **Made File the Source of Truth** (`graph-state.service.ts`)
**Key Change**: When loading data with positions from a saved file:
- **CLEAR** the nodePositions map first (removes old localStorage data)
- **SET** positions from file data
- **SYNC** to localStorage

```typescript
if (hasPositionsInData) {
  // CRITICAL: File is source of truth
  this.nodePositions.clear();  // Clear old data

  // Set positions from file
  data.nodes.forEach(node => {
    if (node.x !== undefined && node.y !== undefined) {
      this.nodePositions.set(node.id, { x: node.x, y: node.y });
    }
  });

  // Sync to localStorage
  this.savePositionsToStorage();
}
```

### 2. **Added Comprehensive Logging**
Added detailed logs throughout the save/load pipeline to track:

**Save Flow:**
- `[Toolbar]` Capture positions from yFiles
- `[Toolbar]` Sample node position
- `[Toolbar]` Edge bend counts
- `[Server]` Sample node being saved
- `[Server]` Edge bend counts

**Load Flow:**
- `[Toolbar]` API response received
- `[Toolbar]` Sample node from API
- `[GraphState]` Data has positions: true/false
- `[GraphState]` Using file positions (source of truth)
- `[DiagramCanvas]` Sample node from data
- `[yFiles]` Nodes with positions
- `[yFiles]` Position source (dataFile/persistedMap/default)

### 3. **Edge Routing Persistence** (`yfiles-graph.service.ts`)
Added full support for saving and restoring edge bend points:
- `getAllEdgeBends()`: Capture all edge bend points
- `setEdgeBends()`: Restore edge bend points
- `bends` field in EdgeData model

### 4. **Server Load Endpoint** (`server.js`)
New endpoint: `GET /api/load-diagram/:filename`
- Loads from `data/` directory first (saved version)
- Falls back to `src/assets/data/` (original version)
- Returns indicator of which source was used

## Files Modified

### Core Functionality:
1. **graph-state.service.ts** - Fixed position loading priority (file > localStorage)
2. **yfiles-graph.service.ts** - Added edge bend capture/restore
3. **toolbar.component.ts** - Enhanced position & edge capture before save
4. **diagram-canvas.component.ts** - Added detailed logging
5. **server.js** - Added load endpoint, enhanced logging

### Data Models:
6. **graph-data.model.ts** - Added `bends` field to EdgeData

### Services:
7. **diagram-persistence.service.ts** - Added loadDiagram() method

## How It Works Now

### Complete Persistence Flow:

```
┌─────────────┐
│ 1. LOAD     │
│ Topology    │──> Server loads from data/ (saved) or assets/ (original)
└─────────────┘    ├─> If saved file exists: Has positions & edge bends
                   └─> If original file: No positions

┌─────────────┐
│ 2. AUTO     │
│ LAYOUT      │──> yFiles repositions nodes hierarchically
└─────────────┘    └─> Edges automatically routed with bend points

┌─────────────┐
│ 3. SAVE     │
│ Diagram     │──> Captures node positions + edge bends from yFiles
└─────────────┘    ├─> Updates graph state
                   ├─> Saves to localStorage
                   └─> Sends to server → Saves to data/*.json

┌─────────────┐
│ 4. RELOAD   │
│ Topology    │──> Loads from data/*.json (saved version)
└─────────────┘    ├─> CLEARS old localStorage data
                   ├─> Uses file positions (source of truth)
                   ├─> Syncs to localStorage
                   └─> Renders with saved layout ✅
```

## Testing

See `AUTO_LAYOUT_TEST.md` for detailed test steps.

### Quick Test:
1. Start server: `npm run server`
2. Load topology: Select & load "mock-graph-data"
3. Apply auto layout: Click "Auto Layout"
4. Save: Click "Save" button
5. Reload: Refresh page or reload topology
6. **Verify**: Graph should have the same hierarchical layout ✅

### Expected Console Output on Reload:
```
[Toolbar] Loaded topology from saved version
[GraphState] Data has positions: true
[GraphState] Using positions from loaded data (FILE IS SOURCE OF TRUTH)
[GraphState] Synced 10 positions to localStorage
[yFiles] Nodes with positions in data: 10/10
[yFiles] Node ... position: (X, Y) from dataFile
```

## What Gets Persisted

### Node Data:
```json
{
  "id": "core-router-1",
  "label": "Core Router 1",
  "type": "router",
  "x": 323.5,      ← Saved position
  "y": 0,          ← Saved position
  "metadata": {...}
}
```

### Edge Data:
```json
{
  "id": "edge-1",
  "sourceId": "router-1",
  "targetId": "switch-1",
  "cableType": "fiber",
  "bends": [       ← Saved routing
    { "x": 150, "y": 225 },
    { "x": 175, "y": 250 }
  ]
}
```

## Benefits

✅ **Complete Persistence**: Both node positions and edge routing saved
✅ **File is Source of Truth**: No more localStorage conflicts
✅ **Auto Layout Works**: Hierarchical layout fully persisted
✅ **Edge Routing Works**: Custom edge paths preserved
✅ **Comprehensive Logging**: Easy to debug issues
✅ **Backwards Compatible**: Falls back to localStorage if no file

## Known Limitations

1. **Requires API Server**: Must run `npm run server` for persistence to work
2. **Two Storage Locations**: Data stored in both file (`data/`) and localStorage (synced)
3. **Manual Positions**: User-dragged positions also saved (feature, not bug)

## Future Enhancements

- Add auto-save after layout application
- Add "Restore Original" button to reset to src/assets version
- Add version timestamps to saved files
- Add undo/redo for layout changes
