# NetSpider Assets

This directory contains all static assets for the NetSpider Pilot application.

## 📁 Directory Structure

```
assets/
├── data/
│   └── mock-graph-data.json      # Network topology mock data
├── images/
│   └── floor-plan-sample.svg     # Floor plan background image
├── icons/
│   ├── router-icon.svg           # Router device icon
│   ├── switch-icon.svg           # Switch device icon
│   ├── server-icon.svg           # Server/rack icon
│   ├── workstation-icon.svg      # Desktop workstation icon
│   └── device-icon.svg           # Generic device icon
├── demo.html                      # Asset preview page
└── README.md                      # This file
```

## 🎨 Visual Assets

### Floor Plan Background
- **File:** `images/floor-plan-sample.svg`
- **Size:** 1200x800px (scalable)
- **Description:** Professional floor plan with rooms, office areas, server room, and network closet
- **Features:**
  - Grid pattern for precise positioning
  - Color-coded zones (server room, offices, conference)
  - Room labels and building legend
  - Desk positions for workstations

### Node Icons
All icons are 48x48px SVG files, fully scalable:

| Icon | File | Color | Represents |
|------|------|-------|------------|
| 🔴 Router | `router-icon.svg` | Red (#ef4444) | Core routers with antennas |
| 🔵 Switch | `switch-icon.svg` | Blue (#3b82f6) | Network switches with ports |
| 🟣 Server | `server-icon.svg` | Purple (#8b5cf6) | Server racks with units |
| 🟠 Workstation | `workstation-icon.svg` | Orange (#f59e0b) | Desktop computers |
| 🟢 Device | `device-icon.svg` | Green (#10b981) | Printers, IoT devices |

## 📊 Mock Data

### Network Topology Data
- **File:** `data/mock-graph-data.json`
- **Format:** JSON
- **Contents:**
  - **12 Nodes:**
    - 1 Core Router
    - 3 Switches (distribution & access)
    - 3 Servers (database, web, file)
    - 3 Workstations
    - 2 Devices (printer, camera)
  - **15 Edges:**
    - Fiber optic connections (high-speed)
    - Ethernet connections (standard)
    - Parallel/redundant links
  - **2 Groups:**
    - Floor 1 Network
    - Server Room (DC-A)

### Data Model
```json
{
  "nodes": [{
    "id": "unique-id",
    "label": "Display Name",
    "type": "router|switch|server|device|workstation",
    "groupId": "optional-group",
    "metadata": { /* custom properties */ }
  }],
  "edges": [{
    "id": "unique-id",
    "sourceId": "node-id",
    "targetId": "node-id",
    "cableType": "fiber|ethernet|coaxial|serial",
    "parallelIndex": 0,
    "label": "optional",
    "metadata": { /* bandwidth, length, etc. */ }
  }],
  "groups": [{
    "id": "unique-id",
    "label": "Group Name",
    "isCollapsed": false
  }]
}
```

## 🚀 Usage in Application

### Loading Mock Data
```typescript
// In ToolbarComponent
this.http.get<GraphData>('/assets/data/mock-graph-data.json')
  .subscribe(data => {
    this.graphState.loadGraphData(data);
  });
```

### Setting Background Image
```typescript
// In YFilesGraphService
this.yFilesService.setBackgroundImage('/assets/images/floor-plan-sample.svg', true);
```

### Using Node Icons
Icons can be referenced in yFiles node templates:
```typescript
iconPath: '/assets/icons/router-icon.svg'
```

## 👀 Preview Assets

To view all assets in your browser:
```
http://localhost:4200/assets/demo.html
```

Or open the file directly:
```bash
start src/assets/demo.html  # Windows
open src/assets/demo.html   # macOS
xdg-open src/assets/demo.html  # Linux
```

## 📝 Customization

### Adding New Icons
1. Create SVG file in `icons/` directory
2. Size: 48x48px viewBox
3. Use consistent color scheme
4. Add to node-styles.ts configuration

### Updating Floor Plan
1. Edit `images/floor-plan-sample.svg`
2. Maintain 1200x800px dimensions
3. Use light background colors for visibility
4. Include clear room labels

### Modifying Mock Data
1. Edit `data/mock-graph-data.json`
2. Follow the data model structure
3. Ensure all edge sourceId/targetId reference valid nodes
4. Add meaningful metadata for demo purposes

## 🎯 Design Guidelines

### Color Scheme
- **Router:** Red (#ef4444) - Critical infrastructure
- **Switch:** Blue (#3b82f6) - Network distribution
- **Server:** Purple (#8b5cf6) - Data/compute
- **Workstation:** Orange (#f59e0b) - End user devices
- **Device:** Green (#10b981) - Peripherals/IoT

### Cable Types
- **Fiber:** Pink (#ec4899), thick (4px) - High bandwidth
- **Ethernet:** Blue (#3b82f6), medium (2px) - Standard
- **Coaxial:** Orange (#f59e0b), medium (3px) - Legacy
- **Serial:** Gray (#6b7280), thin (1px), dashed - Control

## 📦 File Sizes
- Floor Plan SVG: ~8KB
- Each Icon SVG: ~1-2KB
- Mock Data JSON: ~4KB
- **Total:** ~15KB (highly optimized!)

## ✨ Quality Standards
- ✅ All SVGs are optimized and clean
- ✅ Consistent color palette across all assets
- ✅ Professional enterprise-quality design
- ✅ Scalable vector graphics (no pixelation)
- ✅ Accessible color contrast ratios
- ✅ Semantic file naming

---

**Last Updated:** January 2026
**Version:** 1.0
