# Auto Layout Persistence - Diagnostic Checklist

## Critical Fixes Applied

1. ✅ **Priority Fix**: Data file positions now checked FIRST (before localStorage map)
2. ✅ **Map Not Passed**: Persisted positions map not passed if data has positions
3. ✅ **Fit Bounds Logic**: Only fits bounds if NO positions exist
4. ✅ **Comprehensive Logging**: Full visibility into position flow

## Step-by-Step Test

### Step 1: Clean Start
1. Open browser DevTools (F12) → Console tab
2. Clear localStorage: Run `localStorage.clear()` in console
3. Refresh page

### Step 2: Load Topology
1. Select "mock-graph-data" from dropdown
2. Click "Load" button
3. **Look for in console:**
   ```
   [Toolbar] ===== LOAD BUTTON CLICKED =====
   [Toolbar] API load response received: {success: true, loadedFrom: "saved", ...}
   [Toolbar] Sample node from API: {id: "...", x: 323.5, y: 0}
   ```

### Step 3: Check What Graph State Sees
**Look for in console:**
```
[GraphState] ===== loadGraphData CALLED =====
[GraphState] Data has positions: true    ← MUST BE TRUE
[GraphState] Using positions from loaded data (FILE IS SOURCE OF TRUTH)    ← MUST SEE THIS
```

### Step 4: Check What DiagramCanvas Sees
**Look for in console:**
```
[DiagramCanvas] ===== GRAPH DATA RECEIVED =====
[DiagramCanvas] Sample node from data: {id: "...", x: 323.5, y: 0}    ← MUST HAVE X,Y
[DiagramCanvas] Data has positions: true    ← MUST BE TRUE
[DiagramCanvas] Using positions from data file (no map needed)    ← SHOULD SEE THIS
```

### Step 5: Check What yFiles Receives
**Look for in console:**
```
[yFiles] ===== RENDER GRAPH CALLED =====
[yFiles] Persisted positions map: NOT PROVIDED (using data positions)    ← IDEAL
[yFiles] Nodes with positions in data: 10/10    ← ALL NODES SHOULD HAVE POSITIONS
[yFiles] ✓ ALL nodes have positions in data - will use those    ← MUST SEE THIS
[yFiles] Node core-router-1 position: (323.5, 0) from dataFile    ← MUST SAY "dataFile"
[yFiles] Skipping fitGraphBounds (using saved positions)    ← MUST SKIP FIT
```

## What to Look For

### ✅ SUCCESS PATTERN:
```
Load → API returns positions → GraphState: "FILE IS SOURCE OF TRUTH"
→ DiagramCanvas: "no map needed" → yFiles: "from dataFile"
→ Graph renders with saved layout
```

### ❌ FAILURE PATTERNS:

**Pattern 1: No positions in API response**
```
[Toolbar] Sample node from API: {id: "...", x: undefined, y: undefined}
```
**Cause**: API not loading saved file OR file doesn't have positions
**Fix**: Check `data/mock-graph-data.json` - should have x,y values

**Pattern 2: Positions lost in GraphState**
```
[GraphState] Data has positions: false
```
**Cause**: Data being modified before GraphState
**Fix**: Check if something is stripping x,y values

**Pattern 3: Map overrides file**
```
[yFiles] Node ... position: (..., ...) from persistedMap
```
**Cause**: Persisted map being used instead of file
**Fix**: Should be fixed now, but check DiagramCanvas output

**Pattern 4: FitBounds called**
```
[yFiles] Fitting graph bounds (no positions provided)
```
**Cause**: System thinks there are no positions
**Fix**: Check why positions are not detected

## Test Scenario: Full Cycle

### Part A: Save Layout
1. Load topology
2. Click "Auto Layout"
3. Wait for animation to complete
4. Click "Save"
5. **Verify in console:**
   ```
   [Toolbar] Captured 10 node positions
   [Server] Sample node being saved: {x: 323.5, y: 0}
   [Server] File saved successfully!
   ```
6. **Verify file:**
   - Check `data/mock-graph-data.json`
   - First node should have `"x": 323.5, "y": 0`

### Part B: Reload Layout
1. Refresh page (F5)
2. Select "mock-graph-data"
3. Click "Load"
4. **Verify in console:** All success patterns above
5. **Visual verification:** Graph should have hierarchical layout (not random)

## Quick Debug Commands

Run these in browser console to check state:

```javascript
// Check if file has positions
fetch('http://localhost:3000/api/load-diagram/mock-graph-data.json')
  .then(r => r.json())


// Clear everything and retry
localStorage.clear()
```

## Common Issues & Solutions

### Issue: "Cannot connect to API server"
**Solution**: Run `npm run server` in separate terminal

### Issue: Topology loads but wrong positions
**Check**:
- Console shows "loadedFrom: saved" or "loadedFrom: source"
- If "source", saved file doesn't exist
- Verify `data/mock-graph-data.json` exists

### Issue: Positions in file but not rendered
**Check console logs in order:**
1. API returns positions? → [Toolbar] Sample node
2. GraphState receives? → [GraphState] Data has positions
3. DiagramCanvas passes? → [DiagramCanvas] Using positions
4. yFiles applies? → [yFiles] position from dataFile

## Expected Timeline

After fixes, the flow should be:
- **0.0s**: User clicks Load
- **0.1s**: API returns data with positions
- **0.2s**: GraphState processes (clears old map, uses file)
- **0.3s**: DiagramCanvas renders with file positions
- **0.4s**: yFiles applies positions from data
- **0.5s**: Graph visible with saved layout ✅

## If Still Not Working

Please provide:
1. Full console log output (from load to render complete)
2. Content of `data/mock-graph-data.json` (first node)
3. Screenshot of the graph
4. Any error messages

The logs will show exactly where positions are being lost.
