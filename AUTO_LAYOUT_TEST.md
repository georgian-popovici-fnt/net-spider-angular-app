# Auto Layout Persistence Test

## Prerequisites
1. Make sure the API server is running: `npm run server`
2. Make sure the Angular app is running: `npm start`

## Test Steps

### Step 1: Load Original Topology
1. Open the app in browser
2. Select "mock-graph-data" from dropdown
3. Click "Load" button
4. **Check console logs** - you should see:
   ```
   [Toolbar] ===== LOAD BUTTON CLICKED =====
   [Toolbar] API load response received: {...}
   [Toolbar] Sample node from API: { id: "...", x: ..., y: ... }
   [GraphState] Data has positions: true/false
   ```

### Step 2: Apply Auto Layout
1. Click "Auto Layout" button
2. Wait for animation to complete
3. **Observe**: Nodes should be arranged in hierarchical layout
4. **Check console logs** - you should see:
   ```
   [yFiles] Layout animation completed, emitting positions...
   ```

### Step 3: Save Layout
1. Click "Save" button
2. **Check console logs** - you should see:
   ```
   [Toolbar] ===== SAVE BUTTON CLICKED =====
   [Toolbar] Captured X node positions from yFiles
   [Toolbar] Captured X edges with bend points from yFiles
   [Toolbar] Sample node position: { id: "...", x: ..., y: ... }
   [Server] Sample node being saved: { id: "...", x: ..., y: ... }
   [Server] File saved successfully!
   ```
3. **Verify**: Check `data/mock-graph-data.json` file - should have x,y coordinates

### Step 4: Reload and Verify Persistence
1. Refresh the browser page OR click "Load" again
2. **Observe**: Graph should render with the SAME layout as before (hierarchical)
3. **Check console logs** - you should see:
   ```
   [Toolbar] Loaded topology from saved version: mock-graph-data
   [GraphState] Data has positions: true
   [yFiles] Nodes with positions in data: X/X
   [yFiles] Node ... position: (..., ...) from dataFile
   ```

## Expected Results

✅ **Success Indicators:**
- After save: File in `data/` directory has x,y coordinates
- After reload: Notification shows "Loaded saved version"
- After reload: Graph renders with saved layout positions
- Console shows positions coming from "dataFile"

❌ **Failure Indicators:**
- After reload: Graph resets to default random positions
- Console shows "Data has positions: false"
- Console shows positions coming from "default"
- Error: "Cannot connect to API server"

## Troubleshooting

### Issue: "Cannot connect to API server"
**Solution**: Start the server with `npm run server` in a separate terminal

### Issue: Graph resets after reload
**Possible causes:**
1. API server not running (check console for error)
2. Positions not saved to file (check `data/` directory)
3. Loading from assets instead of saved file (check "loaded from" message)

### Issue: Positions saved but not loaded
**Check:**
1. Console log: `[Toolbar] API load response received`
2. Console log: `[Toolbar] Sample node from API` - should have x,y values
3. Console log: `[GraphState] Data has positions:` - should be `true`
4. Console log: Position source should be "dataFile", not "default"

## Current Status
- ✅ Save positions to file: **Working** (verified in data/*.json)
- ❓ Load positions from file: **Testing with enhanced logs**
- ❓ Render with saved positions: **Testing with enhanced logs**

## Console Log Flow

### Save Flow:
```
[Toolbar] ===== SAVE BUTTON CLICKED =====
[Toolbar] Capturing positions...
[Toolbar] Captured 10 node positions
[GraphState] Updating 10 edge bend points
[Server] Sample node being saved: {x: 323.5, y: 0}
[Server] File saved successfully!
```

### Load Flow:
```
[Toolbar] ===== LOAD BUTTON CLICKED =====
[Toolbar] API load response received
[Toolbar] Sample node from API: {x: 323.5, y: 0}
[GraphState] Data has positions: true
[DiagramCanvas] Sample node from data: {x: 323.5, y: 0}
[yFiles] ===== RENDER GRAPH CALLED =====
[yFiles] Nodes with positions in data: 10/10
[yFiles] Node core-router-1 position: (323.5, 0) from dataFile
```
