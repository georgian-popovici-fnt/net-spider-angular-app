# File Save Behavior - Overwrites Original Files

## Overview

The system now **overwrites the original source files** when you save. This ensures that when you load a topology, you ALWAYS get the latest saved version with your layout and changes.

## How It Works

### Before (Old Behavior) ❌
```
Load:  src/assets/data/mock-graph-data.json  (original)
Save:  data/mock-graph-data.json             (separate copy)
Load:  Check data/ first, then src/assets/data/

Problem: Two versions of files, confusing which one loads
```

### Now (New Behavior) ✅
```
Load:  src/assets/data/mock-graph-data.json  (always latest)
Save:  OVERWRITES src/assets/data/mock-graph-data.json
       Creates backup on first save: src/assets/data/backups/mock-graph-data.json

Result: One version, always loads your latest changes
```

## What Happens When You Save

1. **First Save of a File:**
   - Creates backup: `src/assets/data/backups/mock-graph-data.json` (original file)
   - Overwrites: `src/assets/data/mock-graph-data.json` (with your layout)

2. **Subsequent Saves:**
   - Backup already exists, so it's preserved
   - Overwrites: `src/assets/data/mock-graph-data.json` (with your latest changes)

3. **Console Output:**
   ```
   [Server] ========================================
   [Server] File saved successfully!
   [Server] Location: C:\...\src\assets\data\mock-graph-data.json
   [Server] OVERWRITTEN original file - will load this version next time
   [Server] Original backed up to: C:\...\src\assets\data\backups\mock-graph-data.json
   [Server] ========================================
   ```

## Benefits

✅ **Simple & Predictable**: Always loads your latest saved version
✅ **No Confusion**: One file location, one version
✅ **Safe**: Original backed up automatically on first save
✅ **Fast**: No need to check multiple locations

## File Structure

```
src/assets/data/
├── mock-graph-data.json            ← OVERWRITTEN on save (latest version)
├── small-office-network.json       ← OVERWRITTEN on save (latest version)
├── campus-network.json             ← OVERWRITTEN on save (latest version)
└── backups/
    ├── mock-graph-data.json        ← Original file (never modified)
    ├── small-office-network.json   ← Original file (never modified)
    └── campus-network.json         ← Original file (never modified)
```

## Testing the New Behavior

### Test 1: Save and Reload
1. Load "mock-graph-data"
2. Apply auto layout
3. Click Save
4. **Check console**: Should see "OVERWRITTEN original file"
5. Refresh page
6. Load "mock-graph-data" again
7. **Verify**: Graph should have the auto layout positions ✅

### Test 2: Verify File Changed
```bash
# Check the file timestamp
ls -la src/assets/data/mock-graph-data.json

# View the file content
cat src/assets/data/mock-graph-data.json | head -30

# Should show x,y positions in nodes
```

### Test 3: Check Backup Created
```bash
# After first save, this directory should exist
ls -la src/assets/data/backups/

# Backup should exist
cat src/assets/data/backups/mock-graph-data.json | head -30

# Backup should NOT have your layout positions (original file)
```

## Restoring Original Files

If you want to restore a file to its original state:

### Option 1: Copy from Backup
```bash
# Windows Command Prompt
copy src\assets\data\backups\mock-graph-data.json src\assets\data\mock-graph-data.json

# Git Bash / PowerShell
cp src/assets/data/backups/mock-graph-data.json src/assets/data/mock-graph-data.json
```

### Option 2: Use Git (if committed)
```bash
# Restore from git
git checkout src/assets/data/mock-graph-data.json
```

### Option 3: Use the App
1. Delete the backup file: `src/assets/data/backups/mock-graph-data.json`
2. Restart the API server
3. Next save will create a new backup from the current (original) file

## Important Notes

### Git Behavior
- **Main files** (`src/assets/data/*.json`): Tracked by git, will show as modified
- **Backups** (`src/assets/data/backups/`): NOT tracked by git (in .gitignore)

### When to Commit
- **Commit saved files** if you want to preserve the layout in the repository
- **Don't commit** if the saved layout is temporary/personal

### Development Workflow
```bash
# To commit your saved layouts
git add src/assets/data/*.json
git commit -m "Save network layouts with custom positions"

# To discard your saved layouts
git checkout src/assets/data/*.json
```

## API Endpoints

### Load Diagram
```
GET /api/load-diagram/:filename
```
- Loads from: `src/assets/data/{filename}`
- Always returns the latest saved version

### Save Diagram
```
POST /api/save-diagram
Body: { filename, data }
```
- Saves to: `src/assets/data/{filename}` (OVERWRITES)
- Backup: `src/assets/data/backups/{filename}` (first save only)

## Troubleshooting

### Issue: File not updating
**Check:**
1. API server running? `npm run server`
2. Check console for "File saved successfully!"
3. Check file timestamp: `ls -la src/assets/data/mock-graph-data.json`

### Issue: Original file lost
**Solution:**
- Check backup: `src/assets/data/backups/mock-graph-data.json`
- Or restore from git: `git checkout src/assets/data/`

### Issue: Still loading old version
**Possible causes:**
1. Browser cache - hard refresh (Ctrl+Shift+R)
2. API server not restarted - restart `npm run server`
3. Wrong file loaded - check console for which file was loaded

## Migration from Old Behavior

If you have files in the old `data/` directory:

```bash
# Move saved files to source directory
cp data/*.json src/assets/data/

# Remove old data directory
rm -rf data/
```

The old `data/` directory is no longer used.

## Summary

🎯 **One file, one version, always the latest**
💾 **Save overwrites the source file**
🔒 **Original backed up safely on first save**
✅ **Simple, predictable behavior**

No more confusion about which file loads - it's always the file in `src/assets/data/`, which is always your latest saved version!
