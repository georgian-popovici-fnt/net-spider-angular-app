# NetSpider Pilot - Setup Guide

This guide will help you set up and run the NetSpider Pilot application.

## Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- Modern web browser (Chrome, Firefox, Edge, or Safari)
- **yFiles for HTML** library (see installation instructions below)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd net-spider-angular-app
```

### 2. Obtain yFiles for HTML

yFiles for HTML is a commercial product from yWorks. To use it in this pilot:

#### Option A: Request Evaluation License (Recommended)

1. Visit [yWorks Evaluation Page](https://www.yworks.com/products/yfiles-for-html/evaluate)
2. Fill out the evaluation form
3. Download the yFiles for HTML package (usually a `.tgz` file)
4. Create a `lib/` directory in the project root:
   ```bash
   mkdir lib
   ```
5. Place the downloaded yFiles package in the `lib/` directory
6. Rename it to match the package.json reference (or update package.json to match the filename)

#### Option B: Use Existing License

If you already have a yFiles license:

1. Locate your yFiles for HTML package
2. Place it in the `lib/` directory
3. Update `package.json` to reference your package:
   ```json
   "dependencies": {
     "yfiles": "file:./lib/yfiles-YOUR-VERSION.tgz"
   }
   ```

### 3. Install Dependencies

```bash
npm install
```

**Note:** If you haven't placed the yFiles package in `lib/` yet, npm will show a warning. This is expected - the application will run with a placeholder until yFiles is integrated.

### 4. Start Development Server

```bash
npm start
```

The application will be available at `http://localhost:4200`

### 5. Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

### 6. Run Tests

```bash
npm test
```

## Project Structure

```
net-spider-angular-app/
├── src/
│   ├── app/
│   │   ├── components/       # UI components
│   │   ├── services/         # Business logic & yFiles integration
│   │   ├── models/           # TypeScript interfaces
│   │   └── styles/           # Styling configuration
│   ├── assets/
│   │   └── data/             # Mock graph data
│   └── styles/               # Global styles
├── lib/                      # yFiles library (not in git)
└── docs/                     # Documentation
```

## Configuration

### Customizing Mock Data

Edit `src/assets/data/mock-graph-data.json` to modify the network topology:

```json
{
  "nodes": [
    {
      "id": "unique-id",
      "label": "Display Name",
      "type": "router|switch|server|device|workstation",
      "groupId": "optional-group",
      "metadata": { /* custom properties */ }
    }
  ],
  "edges": [
    {
      "id": "unique-id",
      "sourceId": "node-id",
      "targetId": "node-id",
      "cableType": "fiber|ethernet|coaxial|serial",
      "parallelIndex": 0,
      "label": "optional label"
    }
  ]
}
```

### Customizing Colors and Styles

Modify `src/styles/_variables.scss` for global color scheme:

```scss
// Node type colors
$router-color: #ef4444;
$switch-color: #3b82f6;
// ... etc
```

Or modify individual style configurations:
- `src/app/styles/node-styles.ts` - Node appearance
- `src/app/styles/edge-styles.ts` - Edge/cable appearance
- `src/app/styles/graph-theme.ts` - Global theme settings

## yFiles Integration

### Current Status

The application currently runs with a **placeholder** for yFiles. The YFilesGraphService is fully architected but shows placeholder content until yFiles is installed.

### Integrating yFiles

Once you have the yFiles package:

1. Install the package:
   ```bash
   npm install
   ```

2. Update `src/app/services/yfiles-graph.service.ts`:
   - Uncomment yFiles imports
   - Implement the TODO sections marked in the service
   - Reference the comprehensive yFiles documentation at [docs.yworks.com](https://docs.yworks.com/yfiles-html/)

3. Key yFiles classes to use:
   - `GraphComponent` - Main graph visualization
   - `HierarchicLayout` - Auto-layout algorithm
   - `ParallelEdgeRouter` - Multiple edge routing
   - `GroupNodeStyle` - Group visualization
   - `TemplateNodeStyle` - Custom node rendering

## Troubleshooting

### npm install fails with yFiles error

**Problem:** Missing yFiles package in `lib/` directory

**Solution:** Follow step 2 above to obtain and place yFiles package

### Application shows placeholder instead of graph

**Expected behavior:** Until yFiles is fully integrated, the application shows a placeholder message with integration instructions

### Port 4200 already in use

**Solution:**
```bash
ng serve --port 4201
```

### Tests failing

**Common issues:**
- Ensure all dependencies are installed: `npm install`
- Clear Angular cache: `rm -rf .angular`
- Restart: `npm test`

## Next Steps

1. **Load Mock Data:** Click "Load Mock Data" button in toolbar
2. **Explore Features:** Try zoom, pan, layout, and selection
3. **Integrate yFiles:** Follow integration guide above
4. **Customize:** Modify mock data and styles for your use case
5. **Evaluate:** Assess yFiles capabilities (see CAPABILITY_ASSESSMENT.md)

## Support

- **yFiles Documentation:** [docs.yworks.com](https://docs.yworks.com/yfiles-html/)
- **yFiles Support:** [yworks.com/support](https://www.yworks.com/support)
- **Angular Documentation:** [angular.dev](https://angular.dev)

## License

- **Application Code:** [Your License]
- **yFiles for HTML:** Commercial license required from yWorks
