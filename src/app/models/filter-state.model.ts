/**
 * Filter State Models - Type definitions for all filter configurations
 */

export type FilterMode = 'and' | 'or';

export interface TextSearchFilter {
  enabled: boolean;
  query: string;
  fields: string[]; // Which fields to search (e.g., 'label', 'id', 'metadata.ip')
  caseSensitive: boolean;
  useRegex: boolean;
}

export interface FacetFilter {
  attribute: string; // e.g., 'type', 'metadata.vendor'
  selectedValues: Set<string>;
}

export interface NumericRangeFilter {
  attribute: string; // e.g., 'metadata.capacity'
  min: number | null;
  max: number | null;
}

export interface DateRangeFilter {
  attribute: string; // e.g., 'metadata.deploymentDate'
  startDate: Date | null;
  endDate: Date | null;
}

export interface BooleanFilter {
  attribute: string; // e.g., 'metadata.isRedundant'
  value: boolean | null; // null = don't filter, true/false = filter by that value
}

export interface DegreeFilter {
  minInDegree: number | null;
  maxInDegree: number | null;
  minOutDegree: number | null;
  maxOutDegree: number | null;
  minTotalDegree: number | null;
  maxTotalDegree: number | null;
}

export interface VisualFilter {
  selectedOnly: boolean;
  unselectedOnly: boolean;
  visibleOnly: boolean;
}

export interface FilterState {
  mode: FilterMode;
  textSearch: TextSearchFilter;
  facets: FacetFilter[];
  numericRanges: NumericRangeFilter[];
  dateRanges: DateRangeFilter[];
  booleans: BooleanFilter[];
  degree: DegreeFilter | null;
  visual: VisualFilter;
}

export interface FilterStats {
  totalNodes: number;
  visibleNodes: number;
  hiddenNodes: number;
  totalEdges: number;
  visibleEdges: number;
  hiddenEdges: number;
}
