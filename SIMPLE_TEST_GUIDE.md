# Simple Test Guide - Auto Layout Persistence

## NEW: Debug Button Added! 🐛

I've added an **orange debug button** to the toolbar that will show you EXACTLY what positions are where.

## Step-by-Step Test

### 1. Setup
1. Make sure API server is running: `npm run server`
2. Open the app in browser
3. Open browser console (F12)

### 2. Load Topology
1. Select "mock-graph-data" from dropdown
2. Click **Load** button
3. Wait for graph to appear

### 3. Apply Auto Layout
1. Click **Auto Layout** button (🔄)
2. Wait for animation to complete (~1 second)
3. **Observe**: Nodes should arrange in hierarchical layout

### 4. DEBUG - Check Positions BEFORE Save
1. Click the **orange debug button** (🐛)
2. Look at the console output
3. **Check these values:**
   ```
   ========== DEBUG POSITIONS ==========
   1. yFiles positions: 10          ← Should be 10 (or number of nodes)
      First 3 from yFiles: [...]    ← Should show x,y values (NOT 0,0)

   2. Graph data nodes: 10
      Nodes with positions: ?/10    ← Check this number
      First 3 from graph data: [...] ← Check x,y values

   3. Persisted positions map size: ? ← Check this number

   4. Would save to file: mock-graph-data.json
      Data summary: {
        nodes: 10,
        nodesWithPositions: ?  ← Should be 10
        ...
      }
   ========== END DEBUG ==========
   ```

### 5. What the Debug Output Means

**✅ GOOD - Ready to save:**
```
1. yFiles positions: 10
   First 3 from yFiles: [
     {id: "core-router-1", x: 323.5, y: 0},      ← NOT (0,0)
     {id: "dist-switch-1", x: 255, y: 184},      ← NOT (0,0)
     {id: "dist-switch-2", x: 417.5, y: 378}     ← NOT (0,0)
   ]
2. Graph data nodes: 10
   Nodes with positions: 0/10   ← OK, positions not in graph data yet
3. Persisted positions map size: 0   ← OK, not saved yet
4. Would save to file: mock-graph-data.json
   nodesWithPositions: 0   ← OK, will be captured on save
```

**❌ BAD - Positions not in yFiles:**
```
1. yFiles positions: 0   ← PROBLEM: Graph is empty!
```
OR
```
1. yFiles positions: 10
   First 3 from yFiles: [
     {id: "core-router-1", x: 0, y: 0},    ← PROBLEM: All zeros!
     {id: "dist-switch-1", x: 0, y: 0},    ← PROBLEM: Auto layout didn't work!
```

### 6. Save
1. Click **Save** button (💾)
2. Wait for notification "Diagram saved successfully"
3. **Check console for save logs**

### 7. DEBUG - Check Positions AFTER Save
1. Click the **debug button** (🐛) again
2. Now check:
   ```
   2. Graph data nodes: 10
      Nodes with positions: 10/10   ← Should NOW be 10/10
      First 3 from graph data: [
        {id: "core-router-1", x: 323.5, y: 0},   ← Should match yFiles
        ...
      ]
   3. Persisted positions map size: 10   ← Should NOW be 10
   4. Data summary:
      nodesWithPositions: 10   ← Should NOW be 10
   ```

**✅ If you see 10/10 positions after save, the save worked correctly!**

### 8. Verify File on Disk
In terminal/command prompt:
```bash
# Windows Command Prompt
type data\mock-graph-data.json | more

# OR Windows PowerShell / Git Bash
cat data/mock-graph-data.json | head -30
```

Should show:
```json
{
  "nodes": [
    {
      "id": "core-router-1",
      "label": "Core Router 1",
      "type": "router",
      "x": 323.5,      ← MUST have x
      "y": 0,          ← MUST have y
      ...
    }
  ]
}
```

### 9. Reload and Test
1. Refresh the page (F5)
2. Select "mock-graph-data" again
3. Click **Load** button
4. **Observe**: Graph should render with hierarchical layout (same as before)
5. Click **debug button** (🐛) to verify positions loaded

## Troubleshooting with Debug Button

### Problem 1: yFiles has no positions
**Debug shows:**
```
1. yFiles positions: 0
```
**Cause**: Graph not rendered or was cleared
**Solution**: Make sure graph is visible before clicking debug

### Problem 2: yFiles positions are all (0,0)
**Debug shows:**
```
First 3 from yFiles: [
  {id: "...", x: 0, y: 0},
  {id: "...", x: 0, y: 0}
]
```
**Cause**: Auto layout didn't actually move nodes
**Solution**:
- Wait longer after clicking "Auto Layout"
- Check console for layout errors
- Try clicking "Auto Layout" again

### Problem 3: Positions in yFiles but not in graph data after save
**Debug BEFORE save shows:**
```
1. yFiles positions: 10 (with correct x,y)
2. Nodes with positions: 0/10
```
**Debug AFTER save shows:**
```
2. Nodes with positions: 0/10  ← Still zero!
```
**Cause**: Save function not capturing positions correctly
**Solution**: Share the full console output with me

### Problem 4: Positions in graph data but not in file
**Debug AFTER save shows:**
```
2. Nodes with positions: 10/10  ← Correct!
4. nodesWithPositions: 10  ← Correct!
```
**But file doesn't have positions**
**Cause**: Server not saving correctly
**Solution**: Check if API server is running, check server logs

## What to Share If Still Not Working

Click the debug button at these times:
1. **After Auto Layout** (before save)
2. **After Save**
3. **After Reload**

Copy the console output from all three times and share with me. I'll be able to see exactly where the positions are getting lost.

## Quick Commands for Verification

```bash
# Check if API server is running
# You should see "NetSpider API Server" output

# Check if file exists and has positions
cat data/mock-graph-data.json | head -20

# Check file timestamp (should update when you save)
ls -la data/mock-graph-data.json
```

## Expected Working Flow

**BEFORE SAVE (Debug Button #1):**
- yFiles: 10 positions with correct x,y
- Graph data: 0/10 positions ← Expected
- Map: 0 entries ← Expected

**AFTER SAVE (Debug Button #2):**
- yFiles: 10 positions with correct x,y
- Graph data: 10/10 positions ← NOW should be 10/10
- Map: 10 entries ← NOW should be 10
- File: Should have x,y values

**AFTER RELOAD (Debug Button #3):**
- yFiles: 10 positions with correct x,y
- Graph data: 10/10 positions
- Map: 10 entries
- Visual: Same hierarchical layout as before

---

The debug button will show us EXACTLY where the problem is!
