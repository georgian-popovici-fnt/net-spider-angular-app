# NetSpider Mock Data - Network Topologies

This directory contains various network topology mock data files for the NetSpider visualization application. Each file represents a different network architecture and use case.

## Available Topologies

### 1. **Enterprise Network (Default)**
**File:** `mock-graph-data.json`

A typical medium-sized enterprise network with:
- **Nodes:** 12 (1 router, 3 switches, 3 servers, 3 workstations, 2 devices)
- **Architecture:** Hierarchical (Core → Distribution → Access)
- **Features:**
  - Redundant links between core and distribution
  - Server room with database, web, and file servers
  - Floor 1 network with workstations and devices
  - Mixed cable types (fiber for backbone, ethernet for access)

**Best for:** Understanding basic enterprise network design

---

### 2. **Data Center Network**
**File:** `data-center-network.json`

A modern data center with spine-leaf architecture:
- **Nodes:** 20 (4 routers, 6 switches, 7 servers, 3 devices)
- **Architecture:** Spine-Leaf with dual data centers
- **Features:**
  - Full mesh spine-leaf fabric
  - Redundant inter-DC links (100Gbps)
  - High-availability firewalls
  - Load balancer pair
  - Separate storage zone
  - Monitoring and management systems
  - Web → App → Database tier architecture

**Best for:** Understanding cloud/data center architectures, high availability design

---

### 3. **Small Office Network**
**File:** `small-office-network.json`

A simple small business network:
- **Nodes:** 13 (1 router, 1 switch, 11 endpoints)
- **Architecture:** Star topology (single switch)
- **Features:**
  - Internet gateway with firewall
  - WiFi access points with PoE
  - NAS for file storage
  - VoIP phones
  - Security cameras
  - Mix of wired and wireless devices

**Best for:** Small business network planning, understanding basic network components

---

### 4. **Campus Network**
**File:** `campus-network.json`

A multi-building campus network:
- **Nodes:** 21 (1 router, 7 switches, 3 servers, 1 controller, 9 endpoints)
- **Architecture:** Hierarchical multi-site
- **Features:**
  - Three buildings with distribution and access layers
  - Inter-building fiber links
  - Centralized data center
  - WiFi controller managing 150+ APs
  - Campus-wide services (portal, file server, ERP)
  - Redundant links between buildings

**Best for:** Understanding campus/multi-site networks, WAN design

---

### 5. **ISP Core Network**
**File:** `isp-core-network.json`

An Internet Service Provider's core network:
- **Nodes:** 20 (11 routers, 2 switches, 4 servers, 3 devices)
- **Architecture:** Full mesh core with edge routers
- **Features:**
  - 5 core routers (NYC, LAX, CHI, DAL, MIA)
  - Transcontinental 100Gbps links
  - BGP route reflectors
  - Edge routers for peering
  - DNS servers (8.8.8.8, 8.8.4.4)
  - NetFlow monitoring
  - RADIUS authentication
  - Real latency values and distances

**Best for:** Understanding carrier networks, BGP routing, long-haul networks

---

### 6. **Home Office Network**
**File:** `home-office-network.json`

A modern home/remote office setup:
- **Nodes:** 17 (2 routers, 16 devices)
- **Architecture:** Mesh WiFi with mixed endpoints
- **Features:**
  - Cable modem with WiFi 6 router
  - Mesh WiFi nodes for coverage
  - Work laptop with VPN
  - Gaming desktop on wired connection
  - NAS for backup and media
  - Smart home devices (TV, thermostat, speakers)
  - Security cameras
  - Guest network isolation
  - IoT device segmentation

**Best for:** Understanding home networks, WiFi mesh systems, IoT integration

---

### 7. **Hybrid Cloud Network**
**File:** `hybrid-cloud-network.json`

A complex multi-cloud enterprise architecture:
- **Nodes:** 25 (on-premise + AWS + Azure + GCP)
- **Architecture:** Hybrid cloud with site-to-site VPN, SD-WAN
- **Features:**
  - On-premise data center (firewalls, core switches, Oracle DB)
  - AWS production workloads (VPC, EC2 ASG, RDS, S3)
  - Azure disaster recovery site (ASR, geo-replication)
  - GCP analytics platform (BigQuery, Dataflow)
  - IPsec VPN tunnels and MPLS connectivity
  - Cross-cloud data replication and backup

**Best for:** Understanding hybrid/multi-cloud architectures, cloud migration strategies

---

### 8. **Financial Trading Network**
**File:** `financial-trading-network.json`

Ultra-low latency network for high-frequency trading:
- **Nodes:** 29 (firewalls, switches, HFT servers, market feeds)
- **Architecture:** Ultra-low latency with colocation
- **Features:**
  - High-frequency trading engines (< 5 microseconds)
  - FPGA-accelerated trading servers
  - Direct market data feeds (NASDAQ, NYSE, CME)
  - Colocation router with cross-connects to exchanges
  - Order Management System (1M orders/sec)
  - Real-time risk engine
  - Precision time synchronization (PTP, < 100ns)
  - Compliance and surveillance systems

**Best for:** Understanding ultra-low latency networks, financial services compliance

---

### 9. **Manufacturing ICS Network**
**File:** `manufacturing-ics-network.json`

Industrial Control System with IT/OT convergence:
- **Nodes:** 29 (PLCs, SCADA, robots, switches)
- **Architecture:** Purdue Model (IT → DMZ → OT)
- **Features:**
  - IT/OT segmentation with DMZ
  - Unidirectional data diode (OT → IT only)
  - SCADA master controlling 250+ PLCs
  - Industrial robots (ABB, Siemens, Allen-Bradley)
  - Production floor zones (assembly, welding, painting, packaging)
  - Industrial protocols (Modbus, Profinet, EtherNet/IP)
  - Safety systems (SIL 3, emergency stops)
  - Building management (HVAC, compressed air, energy monitoring)
  - Historian for OT data collection

**Best for:** Understanding ICS/SCADA networks, OT security, industrial automation

---

### 10. **Healthcare Network**
**File:** `healthcare-network.json`

HIPAA-compliant hospital network:
- **Nodes:** 40 (EHR, PACS, medical devices, switches)
- **Architecture:** Segmented zones for PHI protection
- **Features:**
  - Epic EHR cluster (8,000 concurrent users, 15M patient records)
  - PACS medical imaging (2 PB storage, DICOM protocol)
  - Radiology Information System (RIS)
  - Clinical floor medical devices (300+ patient monitors, infusion pumps)
  - Operating room systems (anesthesia machines, surgical systems)
  - Medical imaging modalities (CT, MRI, X-Ray)
  - Lab, pharmacy, blood bank systems
  - HL7 integration for all ancillary systems
  - HIPAA audit logging (6 years retention)
  - Disaster recovery and backup

**Best for:** Understanding healthcare IT, medical device integration, HIPAA compliance

---

### 11. **5G Mobile Core Network**
**File:** `5g-mobile-core-network.json`

5G standalone (SA) mobile network architecture:
- **Nodes:** 37 (5GC functions, RAN, UPF, MEC)
- **Architecture:** 3GPP 5G Service-Based Architecture
- **Features:**
  - 5G Core control plane (AMF, SMF, PCF, UDM, AUSF, NRF, NSSF)
  - User Plane Functions (edge + central, 400 Gbps each)
  - Multi-access Edge Computing (MEC) platforms
  - 5G Radio Access Network (gNodeB macro, small cells, indoor)
  - O-RAN architecture (CU/DU split)
  - Network slicing (eMBB, URLLC, mMTC)
  - Direct market data feeds integration
  - IMS core for voice (VoNR)
  - Network analytics and SON (Self-Organizing Network)
  - 25M subscribers + 50M IoT devices
  - Ultra-low latency (< 1ms air interface)

**Best for:** Understanding 5G architecture, network slicing, mobile edge computing

---

## Network Comparison

| Topology | Nodes | Complexity | Use Case |
|----------|-------|------------|----------|
| Enterprise Network | 12 | Medium | Corporate office |
| Small Office | 13 | Low | SMB network |
| Home Office | 17 | Low-Medium | Remote work |
| Data Center | 20 | High | Cloud infrastructure |
| Campus | 21 | High | Multi-building site |
| ISP Core | 20 | Very High | Service provider |
| **Hybrid Cloud** | **25** | **Very High** | **Multi-cloud enterprise** |
| **Financial Trading** | **29** | **Extreme** | **HFT/Ultra-low latency** |
| **Manufacturing ICS** | **29** | **Very High** | **Industrial automation** |
| **Healthcare** | **40** | **Very High** | **Hospital/Medical** |
| **5G Mobile Core** | **37** | **Extreme** | **Telecom/5G network** |

## Node Types

All topologies use these standardized node types:

| Type | Color | Use |
|------|-------|-----|
| **Router** | Red (#ef4444) | Core routers, edge routers, firewalls |
| **Switch** | Blue (#3b82f6) | Distribution and access switches |
| **Server** | Purple (#8b5cf6) | Application servers, databases, storage |
| **Workstation** | Orange (#f59e0b) | Desktop computers, laptops |
| **Device** | Green (#10b981) | Printers, cameras, IoT, special equipment |

## Cable Types

| Type | Color | Width | Use |
|------|-------|-------|-----|
| **Fiber** | Pink (#ec4899) | 4px | High-speed backbone (10-100Gbps) |
| **Ethernet** | Blue (#3b82f6) | 2px | Standard connections (100Mbps-10Gbps) |
| **Coaxial** | Orange (#f59e0b) | 3px | WiFi/wireless connections |
| **Serial** | Gray (#6b7280) | 1px, dashed | Control/management links |

## Metadata Fields

Each node and edge includes rich metadata for realistic visualization:

### Node Metadata Examples:
- IP addresses
- Device models
- Hardware specs (CPU, RAM, storage)
- Operating systems
- Locations
- Purposes/roles

### Edge Metadata Examples:
- Bandwidth (100Mbps to 100Gbps)
- Cable lengths
- Latency (for WAN links)
- Port numbers
- PoE status
- Redundancy information

## Usage

To load a topology in the application:

1. Select the desired topology from the dropdown menu in the toolbar
2. Click the **Load** button
3. Use **Auto Layout** to arrange nodes hierarchically
4. Use **Re-route Edges** to optimize cable routing
5. Drag nodes to customize positions (positions are saved automatically)

## File Format

All files follow the standard NetSpider JSON format:

```json
{
  "nodes": [
    {
      "id": "unique-id",
      "label": "Display Name",
      "type": "router|switch|server|workstation|device",
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
      "label": "optional",
      "metadata": { /* custom properties */ }
    }
  ],
  "groups": [
    {
      "id": "group-id",
      "label": "Group Name",
      "isCollapsed": false
    }
  ]
}
```

## Creating Custom Topologies

To create your own topology:

1. Copy an existing JSON file as a template
2. Modify nodes, edges, and groups
3. Ensure all `sourceId` and `targetId` references are valid
4. Add rich metadata for better visualization
5. Save as a new `.json` file in this directory
6. Add an option to the dropdown in `toolbar.component.html`

## Notes

- All IP addresses in these files are fictional or use reserved ranges
- Data center and ISP topologies use realistic equipment models and specifications
- Latency values in the ISP network are approximate based on fiber distance
- Groups help organize complex topologies but are optional
- Position data is not included in these files - positions are saved separately in browser localStorage

---

**Last Updated:** January 2026
**Version:** 2.0
**Total Topologies:** 11

## Topology Categories

### Basic Networks (3)
Simple, easy-to-understand topologies for learning and small deployments.

### Enterprise & Service Provider (3)
Medium to large-scale networks for corporate and service provider environments.

### Complex Production Networks (5)
Advanced, real-world topologies showcasing specific industry use cases with high complexity and specialized requirements.
