# NetSpider Pilot

> Professional network topology visualization using Angular 19 and yFiles for HTML

A production-ready pilot application that demonstrates NetSpider-style network and floor-plan diagram visualization. Built to evaluate yFiles for HTML as a long-term framework for enterprise network topology management.

## 🎯 Project Overview

NetSpider Pilot is a **client-ready demonstration application** that showcases:

- **Interactive Network Topology:** Visualize routers, switches, servers, and network devices
- **Professional Diagramming:** Clean, enterprise-quality visual design
- **Smart Layouts:** Automatic hierarchical network layout algorithms
- **Manual Positioning:** Drag nodes and persist positions across sessions
- **Multiple Connections:** Support for parallel cables between devices (redundancy)
- **Group Hierarchy:** Organize devices by floor, room, or logical grouping
- **Selection & Details:** Click any device or cable to view detailed information

## ✨ Key Features

### Core Functionality
- ✅ Graph rendering from JSON data
- ✅ Interactive node dragging with position persistence (LocalStorage)
- ✅ Smooth pan and zoom controls
- ✅ Professional node and edge styling by type
- ✅ Selection management with detail panel
- ✅ Auto-layout (hierarchical top-down)
- ✅ Edge re-routing on demand
- ✅ Multiple parallel cables between same devices
- ✅ Background image support (floor plans)
- ✅ Group nodes with collapse/expand
- ✅ Visual legend for node and cable types

### Technical Highlights
- **Angular 19** with standalone components
- **yFiles for HTML** integration (placeholder until licensed)
- **Clean Architecture** with complete yFiles encapsulation
- **Type-Safe** with comprehensive TypeScript models
- **Reactive State Management** using RxJS
- **Unit Tested** with Jasmine/Karma
- **Professional Styling** with SCSS and design system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Modern web browser

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd net-spider-angular-app

# Install dependencies
npm install

# Start development server
npm start
```

Open [http://localhost:4200](http://localhost:4200) in your browser.

### First Steps

1. Click **"Load Mock Data"** button in the toolbar
2. Explore the network topology with mouse:
   - **Drag** to pan the canvas
   - **Mouse wheel** to zoom in/out
   - **Click** nodes or edges to see details
   - **Drag nodes** to reposition them
3. Try the toolbar actions:
   - **Auto Layout** - Apply hierarchical network layout
   - **Re-route Edges** - Optimize cable routing
   - **Reset View** - Fit graph to viewport
   - **Toggle Background** - Show/hide floor plan
   - **Clear Positions** - Reset to default layout

## 📁 Project Structure

```
net-spider-angular-app/
├── src/app/
│   ├── components/
│   │   ├── diagram-canvas/      # Main graph visualization
│   │   ├── toolbar/              # Action buttons
│   │   ├── side-panel/           # Selection details
│   │   └── legend/               # Visual legend
│   ├── services/
│   │   ├── graph-state.service.ts    # State management
│   │   ├── yfiles-graph.service.ts   # yFiles encapsulation
│   │   └── storage.service.ts        # LocalStorage persistence
│   ├── models/
│   │   ├── graph-data.model.ts       # Core data models
│   │   ├── selection.model.ts        # Selection state
│   │   └── view-state.model.ts       # Canvas viewport state
│   └── styles/
│       ├── node-styles.ts            # Node styling config
│       ├── edge-styles.ts            # Edge styling config
│       └── graph-theme.ts            # Theme configuration
├── src/assets/data/
│   └── mock-graph-data.json          # Sample network data
├── docs/
│   ├── SETUP.md                      # Detailed setup guide
│   └── CAPABILITY_ASSESSMENT.md      # yFiles evaluation
└── lib/                              # yFiles library (not in git)
```

## 🏗️ Architecture

### Layered Design

```
┌─────────────────────────────────────┐
│   UI Components                      │  ← yFiles-agnostic
│   (Canvas, Toolbar, SidePanel)      │
└────────────┬────────────────────────┘
             │ Observables & Commands
┌────────────┴────────────────────────┐
│   GraphStateService                  │  ← Business logic
│   (State, Selection, Persistence)   │
└────────────┬────────────────────────┘
             │ Domain models only
┌────────────┴────────────────────────┐
│   YFilesGraphService                 │  ← yFiles wrapper
│   (Complete yFiles encapsulation)   │
└────────────┬────────────────────────┘
             │ yFiles API
┌────────────┴────────────────────────┐
│   yFiles for HTML                    │
└─────────────────────────────────────┘
```

**Key Principle:** UI components never import yFiles types. All interaction happens through services using domain models.

### Core Components

- **DiagramCanvasComponent:** Hosts the yFiles GraphComponent, manages zoom/pan controls
- **ToolbarComponent:** Provides action buttons for layout, routing, data loading
- **SidePanelComponent:** Displays detailed information about selected items
- **LegendComponent:** Shows visual legend for node and cable types

### Core Services

- **GraphStateService:** Central state management using BehaviorSubjects. Manages graph data, selection, view state, and position persistence
- **YFilesGraphService:** Complete encapsulation of yFiles APIs. Handles rendering, layouts, routing, and interactions
- **StorageService:** LocalStorage abstraction for persisting node positions

## 🎨 Customization

### Mock Data

Edit `src/assets/data/mock-graph-data.json`:

```json
{
  "nodes": [
    {
      "id": "router-1",
      "label": "Core Router",
      "type": "router",
      "metadata": {
        "ip": "10.0.0.1",
        "model": "Cisco ASR 9000"
      }
    }
  ],
  "edges": [
    {
      "id": "cable-1",
      "sourceId": "router-1",
      "targetId": "switch-1",
      "cableType": "fiber",
      "label": "10Gbps"
    }
  ]
}
```

### Node Types
- `router` - Red, rectangular
- `switch` - Blue, rectangular
- `server` - Purple, rectangular (larger)
- `device` - Green, circular
- `workstation` - Orange, rectangular

### Cable Types
- `fiber` - Pink, thick (4px)
- `ethernet` - Blue, medium (2px)
- `coaxial` - Orange, medium (3px)
- `serial` - Gray, thin (1px), dashed

### Colors & Styling

Modify `src/styles/_variables.scss`:

```scss
// Customize colors
$router-color: #ef4444;
$switch-color: #3b82f6;
$fiber-color: #ec4899;
// ... etc
```

Or edit individual configs in `src/app/styles/`.

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --code-coverage
```

Key test coverage:
- ✅ StorageService: Position persistence
- ✅ GraphStateService: State management and selection
- ✅ Component smoke tests

## 📚 Documentation

- **[SETUP.md](docs/SETUP.md)** - Detailed installation and configuration guide
- **[CAPABILITY_ASSESSMENT.md](docs/CAPABILITY_ASSESSMENT.md)** - Comprehensive yFiles evaluation for NetSpider

## 🎯 yFiles Integration Status

### Current: Placeholder Mode

The application currently runs with a **fully-architected placeholder** for yFiles. All components and services are production-ready, but YFilesGraphService shows placeholder content until yFiles is installed.

### Next Steps

1. **Obtain yFiles:** Request evaluation license from [yWorks](https://www.yworks.com/products/yfiles-for-html/evaluate)
2. **Install Package:** Place yFiles package in `lib/` directory
3. **Integrate:** Implement TODOs in `YFilesGraphService`
4. **Test:** Verify all features with real yFiles rendering

See [SETUP.md](docs/SETUP.md) for detailed integration instructions.

## 🔍 Why yFiles?

yFiles for HTML is recommended for NetSpider because:

- ✅ **Purpose-Built:** Designed specifically for network topology visualization
- ✅ **Production-Grade:** Battle-tested in enterprise applications
- ✅ **Comprehensive:** All features work out-of-the-box
- ✅ **Performance:** Handles 1000+ nodes smoothly
- ✅ **Support:** Commercial support from yWorks
- ✅ **ROI:** 10x faster than building from scratch

See [CAPABILITY_ASSESSMENT.md](docs/CAPABILITY_ASSESSMENT.md) for full evaluation.

## 🛠️ Technology Stack

- **Frontend Framework:** Angular 19 (standalone components)
- **Graph Library:** yFiles for HTML 3.0+
- **Language:** TypeScript 5.3+
- **State Management:** RxJS BehaviorSubjects
- **Styling:** SCSS with design system
- **Testing:** Jasmine + Karma
- **Build Tool:** Angular CLI

## 📋 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

This is a pilot/evaluation project. For production implementation:

1. Complete yFiles integration
2. Add backend API integration
3. Implement CRUD operations
4. Add authentication/authorization
5. Enhance accessibility (WCAG 2.1 AA)
6. Add internationalization (i18n)

## 📄 License

- **Application Code:** [Your License Here]
- **yFiles for HTML:** Commercial license required from [yWorks](https://www.yworks.com)

## 🔗 Resources

- **yFiles Documentation:** [docs.yworks.com](https://docs.yworks.com/yfiles-html/)
- **yFiles Demos:** [live.yworks.com](https://live.yworks.com/demos/)
- **Angular Documentation:** [angular.dev](https://angular.dev)
- **yWorks Support:** [yworks.com/support](https://www.yworks.com/support)

## 💡 Key Insights

### Why This Architecture?

**Encapsulation Layer:** The YFilesGraphService completely wraps yFiles APIs. This means:
- UI components are framework-agnostic
- Easy to swap libraries if needed
- Simpler unit testing
- Cleaner component code

**Reactive State:** Using RxJS observables provides:
- Automatic UI updates when data changes
- Easy subscription management
- Clear data flow
- Predictable state changes

**Position Persistence:** LocalStorage integration enables:
- User-customized layouts persist across sessions
- Manual positioning overrides auto-layout
- Better user experience
- No backend dependency for pilot

### Production Considerations

Before deploying to production:

1. **Security:** Add authentication, input validation, XSS protection
2. **Performance:** Implement lazy loading, bundle optimization, CDN
3. **Accessibility:** Add ARIA labels, keyboard navigation, screen reader support
4. **Error Handling:** Comprehensive error boundaries and user feedback
5. **Monitoring:** Add analytics, error tracking, performance monitoring
6. **Documentation:** API docs, user guide, admin manual

---

**Built with ❤️ using Angular and yFiles**

For questions or support, see [SETUP.md](docs/SETUP.md) or contact your development team.
