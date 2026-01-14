# Quick Test - File Overwrite Behavior

## Prerequisites
1. **Restart API server**: Kill the old one and run `npm run server`
2. **Check server output**: Should say "Save OVERWRITES original files"

## Step-by-Step Test

### Step 1: Check Original File (Before)
In terminal:
```bash
# Check first node of original file
cat src/assets/data/mock-graph-data.json | head -20
```

Note the x,y values (or lack thereof) in the first node.

### Step 2: Load and Apply Layout
1. Open app in browser
2. Open console (F12)
3. Select "mock-graph-data"
4. Click **Load**
5. Click **Auto Layout** (🔄)
6. Wait for animation to complete

### Step 3: Click Debug Button (Optional)
Click the orange **🐛** button to see current positions in console.

### Step 4: Save
1. Click **Save** (💾)
2. **Watch console output** - should see:
   ```
   [Server] OVERWRITTEN original file - will load this version next time
   [Server] Original backed up to: .../backups/mock-graph-data.json
   ```

### Step 5: Check File Changed (After)
In terminal:
```bash
# Check first node of saved file
cat src/assets/data/mock-graph-data.json | head -20
```

**Expected**: First node should now have x,y values (e.g., x: 323.5, y: 0)

### Step 6: Check Backup Created
In terminal:
```bash
# Check if backup exists
ls -la src/assets/data/backups/

# View backup content
cat src/assets/data/backups/mock-graph-data.json | head -20
```

**Expected**: Backup should exist with original data (without your layout positions)

### Step 7: Reload and Verify
1. Refresh browser (F5)
2. Clear console
3. Select "mock-graph-data"
4. Click **Load**
5. **Check console**:
   ```
   [Toolbar] Nodes with positions: 10/10
   [GraphState] Data has positions: true
   ```
6. **Visual check**: Graph should render with auto layout (same as before save) ✅

## Success Criteria

✅ **Console shows "OVERWRITTEN original file"**
✅ **File `src/assets/data/mock-graph-data.json` has x,y values**
✅ **Backup exists in `src/assets/data/backups/`**
✅ **After reload, graph has saved layout**
✅ **Console shows "Nodes with positions: 10/10"**

## If It Works

You should see this exact flow:

```
1. Apply layout → Nodes arranged hierarchically
2. Save → "OVERWRITTEN original file" in console
3. Check file → Has x,y values
4. Reload → Graph loads with hierarchical layout
5. Success! ✅
```

## If It Doesn't Work

### Problem 1: Console shows error
**Check**: Is API server running? Restart with `npm run server`

### Problem 2: File doesn't have positions
Run the debug button (🐛) and share the output. It will show where positions are lost.

### Problem 3: File has positions but graph doesn't load them
**Check console for**:
```
[Toolbar] Nodes with positions: X/10
```
If X is 0, positions not being loaded. Share console output.

## Clean Start (If Needed)

To start fresh:
```bash
# Stop API server (Ctrl+C)

# Remove any old data directory
rm -rf data/

# Remove backups
rm -rf src/assets/data/backups/

# Restore original files from git (if you want)
git checkout src/assets/data/*.json

# Restart API server
npm run server

# Refresh browser
```

## Quick Verification Commands

```bash
# See if file was modified (check timestamp)
ls -la src/assets/data/mock-graph-data.json

# Count lines (should be more if positions added)
wc -l src/assets/data/mock-graph-data.json

# Check for x,y in file (should find many)
grep -c '"x":' src/assets/data/mock-graph-data.json

# Compare with backup
diff src/assets/data/mock-graph-data.json src/assets/data/backups/mock-graph-data.json
```

## Expected Output Examples

### Console on Save:
```
[Toolbar] ===== SAVE BUTTON CLICKED =====
[yFiles] getAllNodePositions called
[yFiles] nodeMap size: 10
[yFiles] Position 1: core-router-1 = (323.5, 0)
[GraphState] updateNodePositions called with 10 updates
[Server] Sample node being saved: {id: "core-router-1", x: 323.5, y: 0}
[Server] OVERWRITTEN original file - will load this version next time
```

### Console on Load:
```
[Toolbar] ===== LOAD BUTTON CLICKED =====
[Server] Loaded file: .../src/assets/data/mock-graph-data.json
[Server] Nodes: 10, with positions: 10
[Toolbar] Nodes with positions: 10/10
[GraphState] Data has positions: true
[yFiles] ✓ ALL nodes have positions in data - will use those
```

### File Content After Save:
```json
{
  "nodes": [
    {
      "id": "core-router-1",
      "label": "Core Router 1",
      "type": "router",
      "x": 323.5,      ← NEW: Has position
      "y": 0,          ← NEW: Has position
      "metadata": {...}
    }
  ]
}
```

---

**The key test**: After save + reload, does the graph look the same? If YES, it's working! ✅
