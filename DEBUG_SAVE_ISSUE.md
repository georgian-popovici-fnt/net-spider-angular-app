# Debug Save Issue - Complete Test

## The Problem
Save is not working. After saving with auto layout and reloading, the positions are not persisted.

## Test Procedure - Follow EXACTLY

### Step 1: Check File BEFORE Save
In terminal:
```bash
# Check first node of current file
cat src/assets/data/mock-graph-data.json | grep -A 10 '"id": "core-router-1"'
```

**Note down**: Does it have `"x"` and `"y"` fields? What are the values?

### Step 2: Load and Apply Layout
1. Open browser console (F12)
2. Clear console (Ctrl+L or click clear button)
3. Load "mock-graph-data"
4. Click "Auto Layout" button (🔄)
5. Wait 2 seconds for animation

### Step 3: Click Debug Button BEFORE Save
1. Click the orange **🐛** button
2. **Copy the entire console output** and save it as "debug-before-save.txt"
3. Look for section "1. yFiles positions"
   - Should show positions like (323.5, 0), NOT (0, 0)
   - If all zeros, auto layout didn't work!

### Step 4: Click Save Button
1. Click **Save** (💾) button
2. Wait for "Diagram saved successfully" notification
3. **Copy all console output from the save** and save as "save-output.txt"

### Step 5: Click Debug Button AFTER Save
1. Click the orange **🐛** button again
2. **Copy the entire console output** and save it as "debug-after-save.txt"
3. Look for:
   - Section "2. Graph data nodes" → Should now show "Nodes with positions: 10/10"
   - Section "5. Testing load from server" → Check "nodesWithPositions"

### Step 6: Check File AFTER Save
In terminal:
```bash
# Check first node of saved file
cat src/assets/data/mock-graph-data.json | grep -A 10 '"id": "core-router-1"'
```

**Compare with Step 1**: Does it now have `"x"` and `"y"` values? If NO, the problem is in the save!

### Step 7: Check Server Logs
Look at the terminal where you ran `npm run server`.

**Find these lines:**
```
[Server] Sample node being saved: {id: "...", x: ..., y: ...}
[Server] File saved successfully!
[Server] Location: ...src/assets/data/mock-graph-data.json
[Server] OVERWRITTEN original file
```

**Check**: Does "Sample node being saved" show x,y values or undefined?

### Step 8: Reload and Test
1. Refresh browser (F5)
2. Clear console
3. Load "mock-graph-data"
4. Click **🐛** button immediately after load
5. **Copy console output** and save as "debug-after-reload.txt"

## Analysis Questions

### Question 1: Does yFiles have positions?
Look at "debug-before-save.txt", section 1:
```
1. yFiles positions: 10
   First 3 from yFiles: [{x: 323.5, y: 0}, ...]
```

- ✅ If YES (x,y not zero): yFiles is working
- ❌ If NO (all zeros or empty): Auto layout didn't work

### Question 2: Are positions captured after save?
Look at "debug-after-save.txt", section 2:
```
2. Graph data nodes: 10
   Nodes with positions: 10/10
```

- ✅ If "10/10": Positions captured correctly
- ❌ If "0/10": captureCurrentPositions() failed

### Question 3: Does the file have positions?
Check the actual file after save:
```bash
cat src/assets/data/mock-graph-data.json | grep '"x":'
```

- ✅ If you see many "x": lines: File has positions
- ❌ If you see nothing: File doesn't have positions (server issue)

### Question 4: Does server receive positions?
Look at server logs for this line:
```
[Server] Sample node being saved: {id: "...", x: 323.5, y: 0}
```

- ✅ If x,y are numbers: Server received positions
- ❌ If x,y are undefined: Positions not sent to server

### Question 5: Does load get positions?
Look at "debug-after-save.txt", section 5:
```
5. Testing load from server...
   Server returned: {
     nodes: 10,
     nodesWithPositions: 10,
     firstNode: {x: 323.5, y: 0}
   }
```

- ✅ If "nodesWithPositions: 10": Server returns positions
- ❌ If "nodesWithPositions: 0": File doesn't have positions OR server caching

### Question 6: Does reload apply positions?
Look at "debug-after-reload.txt", check yFiles rendering:
```
[yFiles] ✓ ALL nodes have positions in data - will use those
[yFiles] Node core-router-1 position: (323.5, 0) from dataFile
```

- ✅ If "from dataFile": Positions applied correctly
- ❌ If "from default": Positions not being applied

## Failure Patterns

### Pattern A: Auto Layout Doesn't Work
**Symptoms**: "debug-before-save.txt" shows yFiles positions are (0, 0)
**Cause**: Auto layout didn't actually move nodes
**Solution**:
- Wait longer after clicking Auto Layout
- Check for errors in console during layout
- Try clicking Auto Layout again

### Pattern B: Positions Not Captured
**Symptoms**:
- "debug-before-save.txt": yFiles has positions (✓)
- "debug-after-save.txt": Graph data still "0/10" (✗)
**Cause**: captureCurrentPositions() not working
**Solution**: Share both debug files

### Pattern C: Positions Not Sent to Server
**Symptoms**:
- "debug-after-save.txt": Graph data "10/10" (✓)
- Server logs: "x: undefined, y: undefined" (✗)
**Cause**: getCurrentGraphData() not returning positions
**Solution**: Share debug-after-save.txt and server logs

### Pattern D: Server Not Saving
**Symptoms**:
- Server logs: Shows x,y values (✓)
- File check: No x,y in file (✗)
**Cause**: File write failed or wrong path
**Solution**: Share server logs and file content

### Pattern E: File Has Positions But Not Loaded
**Symptoms**:
- File check: Has x,y values (✓)
- "debug-after-save.txt" section 5: nodesWithPositions: 0 (✗)
**Cause**: Server caching or wrong file being read
**Solution**:
- Restart API server
- Check server is reading correct file

### Pattern F: Positions Loaded But Not Applied
**Symptoms**:
- "debug-after-reload.txt": Data has positions (✓)
- Visual: Graph doesn't have layout (✗)
**Cause**: renderGraph() not applying positions
**Solution**: Share debug-after-reload.txt

## What to Share

Please share these 5 things:

1. **debug-before-save.txt** (debug button output before save)
2. **save-output.txt** (console output during save)
3. **debug-after-save.txt** (debug button output after save)
4. **debug-after-reload.txt** (debug button output after reload)
5. **File content**:
   ```bash
   cat src/assets/data/mock-graph-data.json | head -40
   ```

With these 5 outputs, I can tell you EXACTLY where the problem is and provide a targeted fix.

## Quick Checks

```bash
# Is API server running?
# You should see "NetSpider API Server" output

# Check file has positions
grep -c '"x":' src/assets/data/mock-graph-data.json
# Should show a number > 0 after save

# Check file was modified
ls -la src/assets/data/mock-graph-data.json
# Timestamp should update when you save

# Check backup created
ls -la src/assets/data/backups/mock-graph-data.json
# Should exist after first save
```

## Expected Working Flow

**BEFORE SAVE:**
```
yFiles: 10 positions with x,y values
Graph data: 0/10 (not yet captured)
File: No x,y OR old x,y values
```

**AFTER SAVE:**
```
Graph data: 10/10 (captured)
Server logs: Shows x,y values
File: Has new x,y values
Server test: Returns 10/10 with positions
```

**AFTER RELOAD:**
```
Load: Returns 10/10 with positions
yFiles: Applies positions from data file
Visual: Same layout as before save
```

If ANY of these steps show different results, that's where the problem is!
