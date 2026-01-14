/**
 * Simple Express server for persisting diagram changes
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Data directories
const SOURCE_DATA_DIR = path.join(__dirname, 'src', 'assets', 'data'); // Source files (will be overwritten on save)
const BACKUP_DIR = path.join(__dirname, 'src', 'assets', 'data', 'backups'); // Backup original files

/**
 * Save diagram data to file
 * POST /api/save-diagram
 * OVERWRITES the original file in src/assets/data/
 */
app.post('/api/save-diagram', async (req, res) => {
  try {
    const { filename, data } = req.body;

    if (!filename || !data) {
      return res.status(400).json({
        success: false,
        message: 'Missing filename or data'
      });
    }

    // Validate filename (security check)
    if (!filename.match(/^[a-z0-9-]+\.json$/i)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename format'
      });
    }

    const sourceFilePath = path.join(SOURCE_DATA_DIR, filename);

    // Check if source file exists (for validation)
    try {
      await fs.access(sourceFilePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Source file not found'
      });
    }

    // Create backup of the original file (first time only)
    const backupPath = path.join(BACKUP_DIR, filename);

    try {
      // Check if backup already exists
      await fs.access(backupPath);
    } catch (error) {
      // Backup doesn't exist, create it from the original file
      await fs.mkdir(BACKUP_DIR, { recursive: true });
      const originalData = await fs.readFile(sourceFilePath, 'utf8');
      await fs.writeFile(backupPath, originalData, 'utf8');

    }

    // Log sample node to verify positions are being saved
    if (data.nodes && data.nodes.length > 0) {
      const sampleNode = data.nodes[0];
    }

    // Log edge bend information
    if (data.edges && data.edges.length > 0) {
      const edgesWithBends = data.edges.filter(e => e.bends && e.bends.length > 0);
      if (edgesWithBends.length > 0) {
        const sampleEdge = edgesWithBends[0];
        console.log(`[Server] Sample edge bends:`, {
          id: sampleEdge.id,
          bendCount: sampleEdge.bends.length
        });
      }
    }

    // OVERWRITE the original file in src/assets/data/
    await fs.writeFile(sourceFilePath, JSON.stringify(data, null, 2), 'utf8');

    console.log(`[Server] ========================================`);
    console.log(`[Server] File saved successfully!`);
    console.log(`[Server] Location: ${sourceFilePath}`);
    console.log(`[Server] Nodes: ${data.nodes?.length || 0}, Edges: ${data.edges?.length || 0}`);
    console.log(`[Server] OVERWRITTEN original file - will load this version next time`);
    console.log(`[Server] Original backed up to: ${backupPath}`);
    console.log(`[Server] ========================================`);
    res.json({
      success: true,
      message: 'Diagram saved successfully',
      filename: filename
    });

  } catch (error) {
    console.error('[Server] Error saving file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save diagram',
      error: error.message
    });
  }
});

/**
 * Load diagram data from file
 * GET /api/load-diagram/:filename
 * Loads from src/assets/data/ (always the latest saved version)
 */
app.get('/api/load-diagram/:filename', async (req, res) => {
  try {
    const { filename } = req.params;

    // Validate filename (security check)
    if (!filename.match(/^[a-z0-9-]+\.json$/i)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename format'
      });
    }

    const sourceFilePath = path.join(SOURCE_DATA_DIR, filename);

    // Load from source directory (which contains the latest saved version)
    try {
      const fileContent = await fs.readFile(sourceFilePath, 'utf8');
      const data = JSON.parse(fileContent);

      const nodesWithPos = data.nodes?.filter(n => n.x !== undefined && n.y !== undefined).length || 0;

      console.log(`[Server] ===== LOAD FILE =====`);
      console.log(`[Server] File: ${sourceFilePath}`);
      console.log(`[Server] Nodes: ${data.nodes?.length || 0}, with positions: ${nodesWithPos}`);

      // Log first node for debugging
      if (data.nodes && data.nodes.length > 0) {
        const firstNode = data.nodes[0];
        console.log(`[Server] First node:`, {
          id: firstNode.id,
          x: firstNode.x,
          y: firstNode.y
        });
      }

      res.json({
        success: true,
        data: data,
        loadedFrom: 'source',
        filename: filename
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

  } catch (error) {
    console.error('[Server] Error loading file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load diagram',
      error: error.message
    });
  }
});

/**
 * Get list of available diagrams
 * GET /api/diagrams
 */
app.get('/api/diagrams', async (req, res) => {
  try {
    const files = await fs.readdir(SOURCE_DATA_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    res.json({
      success: true,
      files: jsonFiles
    });
  } catch (error) {
    console.error('[Server] Error reading directory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to read diagrams',
      error: error.message
    });
  }
});

/**
 * Health check
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    port: PORT
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n===========================================`);
  console.log(`  NetSpider API Server`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`===========================================\n`);
  console.log(`Data directory:  ${SOURCE_DATA_DIR}`);
  console.log(`Backup directory: ${BACKUP_DIR}`);
  console.log(`\nBehavior:`);
  console.log(`  - Save OVERWRITES original files`);
  console.log(`  - Original files backed up on first save`);
  console.log(`  - Load always gets latest saved version`);
  console.log(`\nEndpoints:`);
  console.log(`  GET  /api/load-diagram/:filename - Load diagram`);
  console.log(`  POST /api/save-diagram           - Save diagram (overwrites original)`);
  console.log(`  GET  /api/diagrams               - List available diagrams`);
  console.log(`  GET  /api/health                 - Health check`);
  console.log(`\n`);
});
