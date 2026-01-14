/**
 * StylingEngineService - Core styling rule engine
 * Manages styling rules and evaluates conditions for conditional styling
 */

import { Injectable, signal, effect } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StylingRule, StylingState, StylingCondition, NodeStyleAction, EdgeStyleAction } from '../models/styling-state.model';
import { NodeData, EdgeData } from '../models/graph-data.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class StylingEngineService {
  // Styling rules as Angular signal
  private rulesSignal = signal<StylingRule[]>([]);

  // Emit rule changes as observable for subscriptions
  private rulesChangedSubject = new BehaviorSubject<StylingRule[]>([]);
  readonly rulesChanged$: Observable<StylingRule[]> = this.rulesChangedSubject.asObservable();

  // Applied count signal
  readonly appliedCount = signal<number>(0);

  // Public read-only rules
  readonly rules = this.rulesSignal.asReadonly();

  constructor(private storageService: StorageService) {
    // Load rules from localStorage on initialization
    this.loadRulesFromStorage();

    // Emit rule changes when state changes
    effect(() => {
      const rules = this.rulesSignal();
      this.rulesChangedSubject.next(rules);
    });
  }

  /**
   * Add a new styling rule
   */
  addRule(rule: StylingRule): void {
    this.rulesSignal.update(rules => {
      const newRules = [...rules, rule];
      this.persistRules(newRules);
      return newRules;
    });
  }

  /**
   * Update an existing rule
   */
  updateRule(id: string, updates: Partial<StylingRule>): void {
    this.rulesSignal.update(rules => {
      const newRules = rules.map(r =>
        r.id === id ? { ...r, ...updates } : r
      );
      this.persistRules(newRules);
      return newRules;
    });
  }

  /**
   * Remove a rule by ID
   */
  removeRule(id: string): void {
    this.rulesSignal.update(rules => {
      const newRules = rules.filter(r => r.id !== id);
      this.persistRules(newRules);
      return newRules;
    });
  }

  /**
   * Toggle rule enabled/disabled
   */
  toggleRule(id: string, enabled: boolean): void {
    this.updateRule(id, { enabled });
  }

  /**
   * Clear all rules
   */
  clearAllRules(): void {
    this.rulesSignal.set([]);
    this.storageService.clearStylingRules();
  }

  /**
   * Get current styling state
   */
  getStylingState(): StylingState {
    return {
      rules: this.rulesSignal(),
      appliedCount: this.appliedCount()
    };
  }

  /**
   * Update applied count
   */
  updateAppliedCount(count: number): void {
    this.appliedCount.set(count);
  }

  /**
   * Evaluate styling rules for a node and return the highest priority matching style
   */
  evaluateNodeRules(nodeData: NodeData): NodeStyleAction | null {
    const enabledRules = this.rulesSignal()
      .filter(rule => rule.enabled && (rule.target === 'node' || rule.target === 'both'))
      .filter(rule => this.matchesCondition(nodeData, rule.condition))
      .sort((a, b) => b.priority - a.priority); // Sort by priority descending

    if (enabledRules.length === 0) {
      return null;
    }

    // Return the highest priority rule's node style
    return enabledRules[0].nodeStyle || null;
  }

  /**
   * Evaluate styling rules for an edge and return the highest priority matching style
   */
  evaluateEdgeRules(edgeData: EdgeData): EdgeStyleAction | null {
    const enabledRules = this.rulesSignal()
      .filter(rule => rule.enabled && (rule.target === 'edge' || rule.target === 'both'))
      .filter(rule => this.matchesCondition(edgeData, rule.condition))
      .sort((a, b) => b.priority - a.priority); // Sort by priority descending

    if (enabledRules.length === 0) {
      return null;
    }

    // Return the highest priority rule's edge style
    return enabledRules[0].edgeStyle || null;
  }

  /**
   * Check if a value matches a condition
   */
  private matchesCondition(data: NodeData | EdgeData, condition: StylingCondition): boolean {
    const value = this.getAttributeValue(data, condition.attribute);

    // If attribute doesn't exist, rule doesn't match
    if (value === undefined || value === null) {
      return false;
    }

    const stringValue = String(value);
    const conditionValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return stringValue === conditionValue;

      case 'contains':
        return stringValue.includes(conditionValue);

      case 'startsWith':
        return stringValue.startsWith(conditionValue);

      case 'endsWith':
        return stringValue.endsWith(conditionValue);

      case 'matches':
        try {
          const regex = new RegExp(conditionValue);
          return regex.test(stringValue);
        } catch (error) {
          // Removed: console.error('[StylingEngine] Invalid regex:', conditionValue, error);
          return false;
        }

      default:
        // Removed: console.warn('[StylingEngine] Unknown operator:', condition.operator);
        return false;
    }
  }

  /**
   * Get attribute value from node/edge data, supporting dot notation for metadata access
   */
  private getAttributeValue(data: NodeData | EdgeData, attribute: string): any {
    // Handle dot notation for nested properties (e.g., 'metadata.vendor')
    const parts = attribute.split('.');
    let value: any = data;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Persist rules to localStorage
   */
  private persistRules(rules: StylingRule[]): void {
    this.storageService.saveStylingRules(rules);
  }

  /**
   * Load rules from localStorage
   */
  private loadRulesFromStorage(): void {
    const savedRules = this.storageService.loadStylingRules();
    if (savedRules && savedRules.length > 0) {
      this.rulesSignal.set(savedRules);
    }
  }
}
