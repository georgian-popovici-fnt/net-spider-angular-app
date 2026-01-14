import { Component, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StylingEngineService } from '../../services/styling-engine.service';
import { StylingRule, StylingTarget, StylingOperator } from '../../models/styling-state.model';

@Component({
  selector: 'app-styling-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './styling-sidebar.component.html',
  styleUrls: ['./styling-sidebar.component.scss']
})
export class StylingSidebarComponent implements OnInit {
  isCollapsed = signal(false);
  rules = this.stylingEngine.rules;
  appliedCount = this.stylingEngine.appliedCount;

  // Computed properties for template
  activeRulesCount = computed(() => this.rules().filter(r => r.enabled).length);
  totalRulesCount = computed(() => this.rules().length);

  // Form state for creating new rules
  newRuleName = '';
  newRuleTarget: StylingTarget = 'node';
  newRuleAttribute = 'type';
  newRuleOperator: StylingOperator = 'equals';
  newRuleValue = '';

  // Style overrides for nodes
  fillColor = '#ff6b6b';
  strokeColor = '#c92a2a';
  strokeWidth = 2;

  // Style overrides for edges
  edgeStrokeColor = '#ff00ff';
  edgeStrokeWidth = 4;

  // Options for dropdowns
  targetOptions: { value: StylingTarget; label: string }[] = [
    { value: 'node', label: 'Node' },
    { value: 'edge', label: 'Edge' },
    { value: 'both', label: 'Both' }
  ];

  operatorOptions: { value: StylingOperator; label: string }[] = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'startsWith', label: 'Starts With' },
    { value: 'endsWith', label: 'Ends With' }
  ];

  // Common attributes for quick selection
  nodeAttributes = ['type', 'label', 'id'];
  edgeAttributes = ['cableType', 'label', 'id'];

  constructor(public stylingEngine: StylingEngineService) {}

  ngOnInit(): void {
    // Ensure sidebar is always expanded on load
    this.isCollapsed.set(false);
    }

  toggleCollapse(): void {
    this.isCollapsed.update(v => !v);
  }

  addRule(): void {
    // Validate form
    if (!this.newRuleName.trim()) {
      alert('Please enter a rule name');
      return;
    }

    if (!this.newRuleValue.trim()) {
      alert('Please enter a condition value');
      return;
    }

    // Generate unique ID
    const id = `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Build the rule
    const rule: StylingRule = {
      id,
      name: this.newRuleName,
      enabled: true,
      target: this.newRuleTarget,
      condition: {
        attribute: this.newRuleAttribute,
        operator: this.newRuleOperator,
        value: this.newRuleValue
      },
      priority: 1
    };

    // Add style actions based on target
    if (this.newRuleTarget === 'node' || this.newRuleTarget === 'both') {
      rule.nodeStyle = {
        fillColor: this.fillColor,
        strokeColor: this.strokeColor,
        strokeWidth: this.strokeWidth
      };
    }

    if (this.newRuleTarget === 'edge' || this.newRuleTarget === 'both') {
      rule.edgeStyle = {
        strokeColor: this.edgeStrokeColor,
        strokeWidth: this.edgeStrokeWidth
      };
    }

    this.stylingEngine.addRule(rule);

    // Reset form
    this.resetForm();
  }

  removeRule(ruleId: string): void {
    if (confirm('Delete this styling rule?')) {
      this.stylingEngine.removeRule(ruleId);
    }
  }

  toggleRule(ruleId: string, enabled: boolean): void {
    this.stylingEngine.toggleRule(ruleId, enabled);
  }

  clearAllRules(): void {
    if (confirm('Clear all styling rules? This will restore default styles.')) {
      this.stylingEngine.clearAllRules();
    }
  }

  resetForm(): void {
    this.newRuleName = '';
    this.newRuleTarget = 'node';
    this.newRuleAttribute = 'type';
    this.newRuleOperator = 'equals';
    this.newRuleValue = '';
    this.fillColor = '#ff6b6b';
    this.strokeColor = '#c92a2a';
    this.strokeWidth = 2;
    this.edgeStrokeColor = '#ff00ff';
    this.edgeStrokeWidth = 4;
  }

  getRuleDescription(rule: StylingRule): string {
    let targetStr = rule.target;
    let conditionStr = `${rule.condition.attribute} ${rule.condition.operator} "${rule.condition.value}"`;
    let styleStr = '';

    if (rule.nodeStyle && (rule.target === 'node' || rule.target === 'both')) {
      const styles: string[] = [];
      if (rule.nodeStyle.fillColor) styles.push(`fill: ${rule.nodeStyle.fillColor}`);
      if (rule.nodeStyle.strokeColor) styles.push(`stroke: ${rule.nodeStyle.strokeColor}`);
      if (rule.nodeStyle.strokeWidth) styles.push(`width: ${rule.nodeStyle.strokeWidth}`);
      styleStr = styles.join(', ');
    } else if (rule.edgeStyle && rule.target === 'edge') {
      const styles: string[] = [];
      if (rule.edgeStyle.strokeColor) styles.push(`color: ${rule.edgeStyle.strokeColor}`);
      if (rule.edgeStyle.strokeWidth) styles.push(`width: ${rule.edgeStyle.strokeWidth}`);
      styleStr = styles.join(', ');
    }

    return `${targetStr}: ${conditionStr} → ${styleStr}`;
  }

  // Update attribute list when target changes
  onTargetChange(): void {
    // Reset attribute to first option
    if (this.newRuleTarget === 'edge') {
      this.newRuleAttribute = 'cableType';
    } else {
      this.newRuleAttribute = 'type';
    }
  }
}
