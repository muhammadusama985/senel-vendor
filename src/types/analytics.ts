export type AnalyticsPeriod =
  | 'today'
  | 'yesterday'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'
  | 'custom';

export interface AnalyticsFilters {
  period: AnalyticsPeriod;
  startDate?: string;
  endDate?: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface PeriodComparison {
  revenue: number;
  orders: number;
  aov: number;
}

export interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalProducts: number;
  periodComparison?: PeriodComparison;
}

export interface TopProduct {
  _id: string;
  title: string;
  sku?: string;
  imageUrl?: string;
  quantity: number;
  revenue: number;
  orders: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface DailyPerformance {
  date: string;
  revenue: number;
  orders: number;
}

export interface PerformanceMetric {
  label: string;
  value: number;
  previousValue?: number;
  change?: number;
  format?: 'currency' | 'percentage' | 'number';
  trend?: 'up' | 'down' | 'stable';
}