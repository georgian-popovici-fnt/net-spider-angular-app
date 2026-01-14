# Save Flow Debugging Guide

## The Problem
When you apply auto layout and click Save, the positions are not being saved to the file. When you reload, you see the original positions, not the auto layout positions.

## Save Flow Step-by-Step

The save process goes through these steps:

```
1. User clicks "Save" button
   ↓
2. toolbar.savePositions() is called
   ↓
3. captureCurrentPositions() is called
   ↓
4. yFilesService.getAllNodePositions() is called
   ↓
5. graphState.updateNodePositions() is called
   ↓
6. graphState.getCurrentGraphData() is called
   ↓
7. Data is sent to server
   ↓
8. Server writes to data/*.json file
```

## What to Check in Console

### Step 1: Click Save Button
Look for:
```
[Toolbar] ===== SAVE BUTTON CLICKED =====
[Toolbar] Function started...
[Toolbar] Got filename: mock-graph-data.json
```

### Step 2: Capture Positions from yFiles
Look for:
```
[Toolbar] Capturing current node positions from yFiles...
[yFiles] getAllNodePositions called
[yFiles] nodeMap size: 10
[yFiles] Position 1: core-router-1 = (323.5, 0)
[yFiles] Position 2: dist-switch-1 = (255, 184)
[yFiles] Position 3: dist-switch-2 = (417.5, 378)
[yFiles] Returning 10 positions
```

**❌ FAILURE CASE 1**: If you see `nodeMap size: 0`, yFiles graph is empty
**❌ FAILURE CASE 2**: If positions are (0, 0), auto layout didn't update yFiles
**❌ FAILURE CASE 3**: If you don't see this log at all, `getAllNodePositions()` wasn't called

### Step 3: Update Graph State
Look for:
```
[Toolbar] Captured 10 node positions from yFiles
[GraphState] updateNodePositions called with 10 updates
[GraphState] Update 1: core-router-1 = (323.5, 0)
[GraphState] Update 2: dist-switch-1 = (255, 184)
[GraphState] Update 3: dist-switch-2 = (417.5, 378)
[GraphState] nodePositions map now has 10 entries
[GraphState] First node after update: {id: "core-router-1", x: 323.5, y: 0}
```

**❌ FAILURE CASE 4**: If map size is 0, positions not being stored
**❌ FAILURE CASE 5**: If first node shows x: undefined, positions not applied to data

### Step 4: Get Current Graph Data
Look for:
```
[Toolbar] Got graphData: 10 nodes
[GraphState] getCurrentGraphData called. Data: 10 nodes
[GraphState] nodePositions map size: 10
[GraphState] getCurrentGraphData first node: {id: "core-router-1", x: 323.5, y: 0, hasInMap: true}
[GraphState] Returning data with positions: 10/10
[Toolbar] Sample node position: {id: "core-router-1", x: 323.5, y: 0}
```

**❌ FAILURE CASE 6**: If `nodePositions map size: 0`, positions lost
**❌ FAILURE CASE 7**: If first node x: undefined, positions not in map
**❌ FAILURE CASE 8**: If `Returning data with positions: 0/10`, positions not merged

### Step 5: Check Edge Bends
Look for:
```
[Toolbar] Captured X edges with bend points from yFiles
[Toolbar] Edges with bend points: X/Y
```

### Step 6: Server Receives Data
Look for:
```
[Server] Sample node being saved: {id: "core-router-1", x: 323.5, y: 0}
[Server] Edges with bend points: X/Y
[Server] File saved successfully!
[Server] Location: C:\Work\Github\net-spider-angular-app\data\mock-graph-data.json
```

**❌ FAILURE CASE 9**: If sample node shows x: undefined, positions didn't reach server
**❌ FAILURE CASE 10**: If you don't see this, HTTP request failed

### Step 7: Verify File on Disk
Run in terminal:
```bash
cat data/mock-graph-data.json | head -20
```

Should show:
```json
{
  "nodes": [
    {
      "id": "core-router-1",
      "label": "Core Router 1",
      "type": "router",
      "x": 323.5,
      "y": 0,
      ...
    }
  ]
}
```

**❌ FAILURE CASE 11**: If file doesn't exist, server didn't write
**❌ FAILURE CASE 12**: If x,y are missing, wrong data was sent

## Complete Test Procedure

### Part A: Apply Auto Layout
1. Open browser console (F12)
2. Load "mock-graph-data" topology
3. Click "Auto Layout" button
4. Wait for animation to complete (1 second)
5. **Verify**: Nodes are arranged hierarchically
6. **Check console**: Should see:
   ```
   [yFiles] Layout animation completed, emitting positions...
   [yFiles] Hierarchical layout applied successfully
   ```

### Part B: Save Layout
1. Click "Save" button
2. **Watch console carefully** - look for ALL the logs mentioned above
3. **Identify failure point**: Where do the logs stop or show wrong values?

### Part C: Verify Save
1. Check console for `[Server] File saved successfully!`
2. In terminal, run:
   ```bash
   cat data/mock-graph-data.json | grep -A 5 "core-router-1"
   ```
3. Should show x and y values
4. Note the x,y values (e.g., x: 323.5, y: 0)

### Part D: Test Reload
1. Refresh page (F5)
2. Click "Load" button
3. **Check console**: Should see:
   ```
   [Toolbar] Sample node from API: {id: "core-router-1", x: 323.5, y: 0}
   ```
4. **Verify**: Graph renders with hierarchical layout (same as before save)

## Common Failure Scenarios

### Scenario 1: yFiles Has No Positions
**Symptoms**:
```
[yFiles] nodeMap size: 0
```
**Cause**: Graph not initialized or cleared
**Solution**: Check if graph is actually visible before clicking save

### Scenario 2: Positions Are (0, 0)
**Symptoms**:
```
[yFiles] Position 1: node-1 = (0, 0)
[yFiles] Position 2: node-2 = (0, 0)
```
**Cause**: Auto layout didn't actually move nodes
**Solution**: Wait longer after clicking "Auto Layout" (watch animation)

### Scenario 3: Positions Not in Graph State
**Symptoms**:
```
[GraphState] nodePositions map size: 0
```
**Cause**: updateNodePositions() not being called or failing
**Solution**: Check if captureCurrentPositions() is being called

### Scenario 4: Positions Not in getCurrentGraphData()
**Symptoms**:
```
[GraphState] Returning data with positions: 0/10
```
**Cause**: Positions not merged into graph data
**Solution**: Check if nodePositions map has data before getCurrentGraphData()

### Scenario 5: Server Not Receiving Positions
**Symptoms**:
```
[Server] Sample node being saved: {id: "...", x: undefined, y: undefined}
```
**Cause**: Data sent to server doesn't have positions
**Solution**: Check what getCurrentGraphData() returned

### Scenario 6: File Not Updated
**Symptoms**: File exists but has old positions
**Cause**: Server wrote wrong data or didn't write at all
**Solution**: Check server logs, verify file timestamp

## Quick Diagnostic Commands

### Check if positions are in yFiles:
Open console and run:
```javascript
// This won't work directly, but the logs will show it when you click save
```

### Check if file has positions:
In terminal:
```bash
# Check file content
cat data/mock-graph-data.json | head -30

# Check file timestamp
ls -la data/mock-graph-data.json

# Compare with source file
diff data/mock-graph-data.json src/assets/data/mock-graph-data.json
```

### Check localStorage:
In console:
```javascript
// See what's in localStorage

```

## What to Share If Still Failing

Please provide:

1. **Console output** from the moment you click "Auto Layout" until you see "File saved successfully"

2. **First node from file** (run this in terminal):
   ```bash
   cat data/mock-graph-data.json | head -20
   ```

3. **Failure point**: Which step failed? (Use the failure case numbers above)

4. **Screenshots**:
   - Graph after auto layout (before save)
   - Graph after reload (after save)

5. **Server status**: Is `npm run server` running?

With this information, I can identify exactly where the positions are being lost.
