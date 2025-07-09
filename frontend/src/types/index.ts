export interface MetricData {
  name: string;
  value: number;
  timestamp: number;
  unit?: string;
  icon?: string;
  color?: string;
}

export interface MetricHistory {
  timestamp: number;
  value: number;
}

export interface MetricWithHistory extends MetricData {
  history: MetricHistory[];
}

export interface DashboardConfig {
  refreshInterval: number;
  displayedMetrics: string[];
  chartTimeRange: number; // em minutos
}
