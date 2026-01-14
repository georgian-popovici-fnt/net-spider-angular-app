import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, map } from 'rxjs';
import { GraphStateService } from '../../services/graph-state.service';
import { SelectionState, SelectionDetails, DisplayProperty } from '../../models/selection.model';
import { NodeData, EdgeData } from '../../models/graph-data.model';

@Component({
  selector: 'app-side-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-panel.component.html',
  styleUrl: './side-panel.component.scss'
})
export class SidePanelComponent {
  selection$: Observable<SelectionState> = this.graphState.selection$;
  details$: Observable<SelectionDetails | null>;
  showRawData = false;

  // Property categories for organization
  private readonly basicProps = ['ID', 'Label', 'Type', 'Cable Type'];
  private readonly connectionProps = [
    'Source', 'Target', 'Source Id', 'Target Id', 'Source Label', 'Target Label',
    'Source Type', 'Target Type', 'Direction', 'Incoming Connections',
    'Outgoing Connections', 'Total Connections', 'Parallel Index',
    'Parallel Edges Count'
  ];
  private readonly positionProps = [
    'Position', 'Position X', 'Position Y', 'Group', 'Group Id', 'Group ID',
    'Group Name', 'Group Collapsed'
  ];
  private readonly technicalProps = [
    'IP', 'Model', 'Software', 'Hardware', 'Protocol', 'Bandwidth', 'Throughput',
    'Latency', 'CPU', 'RAM', 'Storage', 'Ports', 'VLAN', 'Network', 'Subnet',
    'Capacity', 'Speed', 'Frequency', 'Standard', 'Database', 'DB', 'Engine',
    'Service', 'Function', 'Vendor', 'Version', 'OS', 'Instance', 'Size',
    'Architecture', 'Features', 'Certification', 'Compliance', 'Purpose',
    'Role', 'Location', 'Region', 'Zone', 'Nodes', 'Count', 'Power', 'Interface',
    'Uplink', 'Downlink', 'Duplex', 'MTU', 'Port', 'Link', 'Circuit', 'Provider',
    'Backbone', 'Transit', 'Peering', 'BGP', 'OSPF', 'MPLS', 'VPN', 'Tunnel',
    'Encryption', 'Authentication', 'QoS', 'SLA', 'Uptime', 'Availability'
  ];

  constructor(private graphState: GraphStateService) {
    this.details$ = this.selection$.pipe(
      map((selection) => {
        const details = this.graphState.getSelectionDetails();
        return details;
      })
    );

    // Debug: Subscribe to selection$ to see what's happening
    this.selection$.subscribe(sel => {
      });
  }

  getSelectionCount(selection: SelectionState): number {
    return selection.selectedNodes.length + selection.selectedEdges.length;
  }

  formatSelectionType(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1);
  }

  getTypeIcon(type: 'node' | 'edge'): string {
    return type === 'node' ? '🔵' : '🔗';
  }

  getMainLabel(details: SelectionDetails): string {
    const labelProp = details.displayProperties.find(p => p.label === 'Label');
    return labelProp?.value || details.data.id;
  }

  getBasicProperties(details: SelectionDetails): DisplayProperty[] {
    return details.displayProperties.filter(p =>
      this.basicProps.includes(p.label)
    );
  }

  getConnectionProperties(details: SelectionDetails): DisplayProperty[] {
    return details.displayProperties.filter(p =>
      this.connectionProps.includes(p.label)
    );
  }

  getPositionProperties(details: SelectionDetails): DisplayProperty[] {
    return details.displayProperties.filter(p =>
      this.positionProps.includes(p.label)
    );
  }

  getTechnicalProperties(details: SelectionDetails): DisplayProperty[] {
    return details.displayProperties.filter(p =>
      this.isTechnicalProperty(p.label) &&
      !this.basicProps.includes(p.label) &&
      !this.connectionProps.includes(p.label) &&
      !this.positionProps.includes(p.label)
    );
  }

  getAdditionalProperties(details: SelectionDetails): DisplayProperty[] {
    return details.displayProperties.filter(p =>
      !this.basicProps.includes(p.label) &&
      !this.connectionProps.includes(p.label) &&
      !this.positionProps.includes(p.label) &&
      !this.isTechnicalProperty(p.label)
    );
  }

  private isTechnicalProperty(label: string): boolean {
    return this.technicalProps.some(tech =>
      label.toLowerCase().includes(tech.toLowerCase())
    );
  }

  toggleRawData(): void {
    this.showRawData = !this.showRawData;
  }

  formatRawData(data: NodeData | EdgeData): string {
    return JSON.stringify(data, null, 2);
  }

  isMultilineValue(value: string): boolean {
    // Check if value contains newlines or is JSON-formatted
    return value.includes('\n') || value.includes('{') || value.includes('[');
  }

  copyToClipboard(text: string): void {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => {
          // Optional: Show a toast notification
          this.showCopyFeedback();
        },
        (err) => {
          // Removed: console.error('[SidePanel] Failed to copy:', err);
          // Fallback to older method
          this.fallbackCopyToClipboard(text);
        }
      );
    } else {
      // Fallback for older browsers
      this.fallbackCopyToClipboard(text);
    }
  }

  private fallbackCopyToClipboard(text: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      this.showCopyFeedback();
    } catch (err) {
      // Removed: console.error('[SidePanel] Fallback copy failed:', err);
    }
    document.body.removeChild(textarea);
  }

  private showCopyFeedback(): void {
    // Simple visual feedback - could be enhanced with a toast component
    // For now, just log success
    // In a production app, you'd show a toast notification
  }

  deleteSelected(details: SelectionDetails): void {
    const itemType = details.type;
    const itemId = details.data.id;
    const itemLabel = this.getMainLabel(details);

    const confirmMessage = itemType === 'node'
      ? `Are you sure you want to delete node "${itemLabel}"?\n\nThis will also delete all connected edges.`
      : `Are you sure you want to delete edge "${itemLabel}"?`;

    if (confirm(confirmMessage)) {

      if (itemType === 'node') {
        this.graphState.deleteNode(itemId);
      } else if (itemType === 'edge') {
        this.graphState.deleteEdge(itemId);
      }
    }
  }
}
