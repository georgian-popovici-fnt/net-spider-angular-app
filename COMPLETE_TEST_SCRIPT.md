# Complete Test Script - Find the Issue

## This Will Definitively Show What's Wrong

Follow this script EXACTLY. Don't skip any steps.

## Step 1: Restart API Server

```bash
# Kill the current server (Ctrl+C in the terminal where it's running)
# Then start it fresh
npm run server
```

**Verify**: Should see "Save OVERWRITES original files" in the output.

## Step 2: Check Original File

```bash
# Run this command
cat src/assets/data/mock-graph-data.json | head -20
```

**Save the output** - note if first node has x,y fields.

## Step 3: Open App

1. Open browser
2. Open DevTools (F12) → Console tab
3. Clear console (Ctrl+L)

## Step 4: Load Topology

1. Select "mock-graph-data" from dropdown
2. Click **Load** button
3. **In server terminal**, you should see:
   ```
   [Server] ===== LOAD FILE =====
   [Server] File: .../src/assets/data/mock-graph-data.json
   [Server] Nodes: 10, with positions: X
   [Server] First node: {id: "...", x: ..., y: ...}
   ```

**Write down**:
- With positions: X (is it 0 or 10?)
- First node x,y values

## Step 5: Apply Auto Layout

1. Click **Auto Layout** button (🔄)
2. **WAIT** 2 full seconds
3. **Observe**: Nodes should arrange in hierarchical layout

## Step 6: Debug BEFORE Save

1. Click orange **🐛** button
2. Wait for alert "Check console..."
3. Click OK
4. **In console**, find these sections:

```
========== DEBUG POSITIONS ==========
1. yFiles positions: 10
   First 3 from yFiles: [
     {id: "...", x: 323.5, y: 0},     ← Write down these values
     {id: "...", x: 255, y: 184},
     {id: "...", x: 417.5, y: 378}
   ]

2. Graph data nodes: 10
   Nodes with positions: 0/10           ← Write down this number

5. Testing load from server...
   Server returned: {
     nodesWithPositions: X,              ← Write down this number
     firstNode: {x: ..., y: ...}
   }
========== END DEBUG ==========
```

**Write down** these 3 numbers:
- yFiles first node x,y
- Graph data positions X/10
- Server returned nodesWithPositions: X

## Step 7: Save

1. Click **Save** button (💾)
2. Wait for "Diagram saved successfully" notification

**In server terminal**, you should see:
```
[Server] Sample node being saved: {id: "...", x: ..., y: ...}
[Server] ========================================
[Server] File saved successfully!
[Server] Location: .../src/assets/data/mock-graph-data.json
[Server] OVERWRITTEN original file
[Server] ========================================
```

**Write down**: x,y values in "Sample node being saved"

## Step 8: Debug AFTER Save

1. Click orange **🐛** button again
2. Wait for alert
3. Click OK
4. **In console**, find:

```
========== DEBUG POSITIONS ==========
2. Graph data nodes: 10
   Nodes with positions: X/10           ← Write down this number

5. Testing load from server...
   Server returned: {
     nodesWithPositions: X,              ← Write down this number
     firstNode: {x: ..., y: ...}
   }
========== END DEBUG ==========
```

**Write down** these 2 numbers:
- Graph data positions X/10
- Server returned nodesWithPositions: X

**In server terminal**, check for:
```
[Server] ===== LOAD FILE =====
[Server] Nodes: 10, with positions: X    ← Write down this number
[Server] First node: {x: ..., y: ...}    ← Write down x,y
```

## Step 9: Check File on Disk

```bash
cat src/assets/data/mock-graph-data.json | head -20
```

**Check**: Does the first node have x,y fields now? Write down the values.

## Step 10: Reload Page

1. Refresh browser (F5)
2. Clear console
3. Select "mock-graph-data"
4. Click **Load**

**In console**, check for:
```
[Toolbar] Nodes with positions: X/10
[GraphState] Data has positions: true/false
[yFiles] ✓ ALL nodes have positions in data
[yFiles] Node core-router-1 position: (..., ...) from dataFile
```

**Write down**:
- Nodes with positions: X/10
- Data has positions: true/false
- Position source: dataFile/persistedMap/default

**Visual check**: Does the graph have the hierarchical layout? YES/NO

## Step 11: Results Summary

Fill this out with the values you wrote down:

### BEFORE SAVE:
- yFiles first node: x=____ y=____
- Graph data positions: ___/10
- Server returns positions: ___/10
- File has x,y: YES/NO

### DURING SAVE:
- Server received node x=____ y=____
- Server wrote to file: YES/NO

### AFTER SAVE:
- Graph data positions: ___/10
- Server returns positions: ___/10
- File has x,y: YES/NO
- File first node: x=____ y=____

### AFTER RELOAD:
- Toolbar nodes with positions: ___/10
- GraphState has positions: YES/NO
- yFiles position source: ________
- Visual has layout: YES/NO

## Diagnosis

### If yFiles first node is (0, 0):
**Problem**: Auto layout didn't work
**Solution**: Wait longer, check console for layout errors

### If BEFORE SAVE "Graph data positions" is 0/10:
**Problem**: Positions not in graph data before save (expected)
**OK**: This is normal before save

### If DURING SAVE server received undefined:
**Problem**: captureCurrentPositions() didn't work
**Look at**: AFTER SAVE "Graph data positions" - should be 10/10

### If AFTER SAVE "Graph data positions" is still 0/10:
**Problem**: captureCurrentPositions() failed completely
**Share**: Console output from save operation

### If AFTER SAVE "Server returns positions" is 0/10:
**Problem**: File doesn't have positions OR server reading wrong file
**Check**: File on disk with `cat` command - does it have x,y?

### If File has x,y but "Server returns 0/10":
**Problem**: Server caching or reading old file
**Solution**: Restart API server and try again

### If File has x,y and "Server returns 10/10":
**Problem**: Positions reaching server but not being applied
**Check**: AFTER RELOAD "yFiles position source" - should be "dataFile"

### If "yFiles position source" is "default":
**Problem**: Positions not being applied in renderGraph()
**Share**: Console output from reload

## Share These Results

Please share your completed results summary above, along with:

1. Output of: `cat src/assets/data/mock-graph-data.json | head -30`
2. Screenshot of graph after auto layout
3. Screenshot of graph after reload

With this information, I can tell you EXACTLY what's wrong and fix it immediately.

## Most Likely Issues

Based on your description, I expect one of these:

**A. Positions captured but not saved to file**
- Symptoms: Graph data 10/10, but file has 0/10
- Cause: Server write failing

**B. Positions saved to file but not loaded**
- Symptoms: File has x,y, but server returns 0/10
- Cause: Server caching

**C. Positions loaded but not applied**
- Symptoms: Server returns 10/10, but yFiles uses "default"
- Cause: renderGraph() issue

The test above will show which one it is!
