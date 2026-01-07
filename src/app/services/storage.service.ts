/**
 * StorageService - LocalStorage abstraction for persisting node positions
 * Handles serialization, deserialization, and error handling
 */

import { Injectable } from '@angular/core';
import { Position } from '../models/view-state.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly POSITIONS_KEY = 'netspider-node-positions';

  /**
   * Save node positions to LocalStorage
   * @param positions Map of node ID to position
   */
  savePositions(positions: Map<string, Position>): void {
    if (!this.isStorageAvailable()) {
      console.warn('LocalStorage not available');
      return;
    }

    try {
      const data = Array.from(positions.entries());
      localStorage.setItem(this.POSITIONS_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save positions:', error);
      // Handle quota exceeded or other storage errors gracefully
    }
  }

  /**
   * Load node positions from LocalStorage
   * @returns Map of node ID to position, or null if not found
   */
  loadPositions(): Map<string, Position> | null {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      const json = localStorage.getItem(this.POSITIONS_KEY);
      if (!json) {
        return null;
      }

      const data = JSON.parse(json) as Array<[string, Position]>;
      return new Map(data);
    } catch (error) {
      console.error('Failed to load positions:', error);
      return null;
    }
  }

  /**
   * Clear all saved node positions
   */
  clearPositions(): void {
    if (this.isStorageAvailable()) {
      localStorage.removeItem(this.POSITIONS_KEY);
    }
  }

  /**
   * Check if LocalStorage is available
   * @returns true if LocalStorage is available and functional
   */
  isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}
