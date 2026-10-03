export interface User {
  id: number;
  email: string;
  name: string;
}

export interface HealthProfile {
  id: number;
  userId: number;
  dateOfBirth?: string | null;
  gender?: string | null;
  height?: number | null;
  weight?: number | null;
  diabetesType?: string | null;
  diagnosisDate?: string | null;
  targetGlucoseMin?: number | null;
  targetGlucoseMax?: number | null;
}

export interface GlucoseReading {
  id: number;
  userId: number;
  glucoseValue: number;
  unit: string;
  measuredAt: string;
  context?: string | null;
  notes?: string | null;
}

export interface DashboardSummary {
  totalReadings: number;
  averageGlucose: number | null;
  minimumGlucose: number | null;
  maximumGlucose: number | null;
  latestReading: GlucoseReading | null;
}

export type AnalyticsPeriod = "today" | "7d" | "14d" | "30d";

export interface AnalyticsComparison {
  previousPeriodLabel: string;
  previousReadingCount: number;
  readingCountChange: number;
  averageChange: number | null;
  averageChangePercent: number | null;
  timeInRangeChange: number | null;
}

export interface AnalyticsInsight {
  id: string;
  type: "TREND" | "TIME_IN_RANGE" | "COMPARISON" | "DATA_AVAILABILITY";
  severity: "INFO" | "OBSERVATION";
  title: string;
  description: string;
  value: number | null;
  unit: string | null;
}

export interface DashboardAnalytics {
  period: AnalyticsPeriod;
  periodLabel: string;
  unit: "mg/dL";
  readingCount: number;
  average: number | null;
  minimum: number | null;
  maximum: number | null;
  targetRange: { minimum: number; maximum: number } | null;
  belowTarget: number | null;
  inTarget: number | null;
  aboveTarget: number | null;
  timeInRange: number | null;
  trend: "INCREASING" | "DECREASING" | "STABLE" | "INSUFFICIENT_DATA";
  trendChange: number | null;
  comparison: AnalyticsComparison | null;
  insights: AnalyticsInsight[];
  disclaimer: string;
}