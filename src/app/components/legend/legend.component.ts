import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NodeType, CableType } from '../../models/graph-data.model';
import { NODE_TYPE_COLORS, CABLE_TYPE_COLORS } from '../../styles/graph-theme';

@Component({
  selector: 'app-legend',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './legend.component.html',
  styleUrl: './legend.component.scss'
})
export class LegendComponent {
  nodeTypes = [
    { key: NodeType.ROUTER, label: 'Router', color: NODE_TYPE_COLORS.router },
    { key: NodeType.SWITCH, label: 'Switch', color: NODE_TYPE_COLORS.switch },
    { key: NodeType.SERVER, label: 'Server', color: NODE_TYPE_COLORS.server },
    { key: NodeType.DEVICE, label: 'Device', color: NODE_TYPE_COLORS.device },
    { key: NodeType.WORKSTATION, label: 'Workstation', color: NODE_TYPE_COLORS.workstation }
  ];

  cableTypes = [
    { key: CableType.FIBER, label: 'Fiber Optic', color: CABLE_TYPE_COLORS.fiber, width: 4, dashed: false },
    { key: CableType.ETHERNET, label: 'Ethernet', color: CABLE_TYPE_COLORS.ethernet, width: 2, dashed: false },
    { key: CableType.COAXIAL, label: 'Coaxial', color: CABLE_TYPE_COLORS.coaxial, width: 3, dashed: false },
    { key: CableType.SERIAL, label: 'Serial', color: CABLE_TYPE_COLORS.serial, width: 1, dashed: true }
  ];
}
