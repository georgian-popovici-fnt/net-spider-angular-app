# Diagram Persistence Feature

## Overview

The NetSpider application now includes a **diagram persistence feature** that allows you to save changes back to the original JSON files. When you move nodes, modify the graph, and click the Save button, all changes are persisted to the file on disk.

## Features

- ✅ **Persistent Node Positions** - Node positions are saved to the original JSON file
- ✅ **Automatic Backups** - Original files are backed up before saving
- ✅ **Real-time Updates** - Changes are immediately visible on next load
- ✅ **Full Graph State** - All node and edge data is persisted
- ✅ **Safe Operations** - Backups are created in `src/assets/data/backups/`

## How to Use

### 1. Start the Backend Server

The persistence feature requires a Node.js backend server to handle file operations.

**Open a NEW terminal** and run:
```bash
npm run server
```

You should see:
```
===========================================
  NetSpider API Server
  http://localhost:3000
===========================================
```

**Important:** Keep this server running while using the application.

### 2. Start the Frontend Application

In another terminal, run:
```bash
npm start
```

The application will be available at `http://localhost:4200` or `http://localhost:4201`

### 3. Make Changes and Save

1. **Load a topology** from the dropdown
2. **Move nodes** by dragging them to new positions
3. **Add or remove nodes/edges** (if implemented)
4. **Click the Save button** (💾) in the toolbar

### 4. Success!

When you click Save:
- ✓ Changes are saved to localStorage (browser storage)
- ✓ A backup is created in `src/assets/data/backups/`
- ✓ The original JSON file is updated with new positions
- ✓ You'll see a success message

## Example Workflow

```bash
# Terminal 1 - Backend Server
npm run server

# Terminal 2 - Frontend Application
npm start

# Then in browser:
# 1. Open http://localhost:4200
# 2. Load "Enterprise Network (12 nodes)"
# 3. Rearrange nodes to your liking
# 4. Click Save button (💾)
# 5. Reload the page
# 6. Load the same topology again
# 7. Your changes are preserved! ✨
```

## File Structure

```
src/assets/data/
├── mock-graph-data.json           # Original files
├── small-office-network.json
├── home-office-network.json
└── backups/                        # Automatic backups
    ├── mock-graph-data.json
    ├── small-office-network.json
    └── ...
```

## API Endpoints

The backend server provides these endpoints:

- `POST /api/save-diagram` - Save diagram changes to file
- `GET /api/diagrams` - List available diagram files
- `GET /api/health` - Check server status

## Error Handling

### Server Not Running

If the backend server is not running, you'll see:
```
⚠ Cannot connect to API server.

Make sure the backend server is running:
npm run server

Positions saved to browser storage only.
```

**Solution:** Start the backend server with `npm run server`

### File Not Found

If you try to save without loading a file first:
```
No file loaded. Please load a topology first.
```

**Solution:** Load a topology from the dropdown before saving

### Permission Errors

If the server cannot write to files:
```
Failed to save diagram: Permission denied
```

**Solution:** Check file permissions in `src/assets/data/`

## Technical Details

### Backend (server.js)
- Express.js server on port 3000
- CORS enabled for frontend communication
- Automatic backup creation before save
- JSON validation and security checks

### Frontend Services
- `DiagramPersistenceService` - API communication
- `GraphStateService` - Tracks current filename
- `ToolbarComponent` - Save button handler

### Data Flow
1. User clicks Save (💾)
2. Frontend sends data to `POST /api/save-diagram`
3. Backend creates backup in `backups/` folder
4. Backend writes updated data to original file
5. Success message displayed to user

## Security

- ✅ Filename validation (only alphanumeric + hyphens)
- ✅ Directory traversal prevention
- ✅ File existence check before save
- ✅ Automatic backups before overwrite
- ✅ CORS restricted to localhost

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, edit `server.js`:
```javascript
const PORT = 3001; // Change to different port
```

Then update `diagram-persistence.service.ts`:
```typescript
private apiUrl = 'http://localhost:3001/api';
```

### Changes Not Persisting

1. Check backend server is running: `curl http://localhost:3000/api/health`
2. Check browser console for errors (F12)
3. Verify file permissions in `src/assets/data/`
4. Check backups are being created in `backups/` folder

### Restore from Backup

If you need to restore a previous version:
```bash
cd src/assets/data/backups
cp mock-graph-data.json ../mock-graph-data.json
```

## Development Notes

- Backups are created with the same filename in `backups/` folder
- Each save overwrites the previous backup (only 1 backup per file)
- JSON files are formatted with 2-space indentation for readability
- The server logs all save operations to console

## Future Enhancements

Potential improvements:
- Multiple backup versions with timestamps
- Export to different filename
- Undo/Redo functionality
- Conflict detection for concurrent edits
- Cloud storage integration
