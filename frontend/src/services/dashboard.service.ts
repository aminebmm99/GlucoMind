import { api } from "./api";
import type {
  AnalyticsPeriod,
  DashboardAnalytics,
  DashboardSummary,
  GlucoseReading,
} from "../types/api";

export async function getDashboardSummary() {
  const response = await api.get<DashboardSummary>(
    "/dashboard/summary",
  );

  return response.data;
}

export async function getDashboardPeriod(
  period: AnalyticsPeriod,
) {
  const response = await api.get<{
    period: string;
    totalReadings: number;
    averageGlucose: number | null;
    minimumGlucose: number | null;
    maximumGlucose: number | null;
    readings: GlucoseReading[];
  }>("/dashboard/period", {
    params: { period },
  });

  return response.data;
}

export async function getDashboardAnalytics(
  period: AnalyticsPeriod,
): Promise<DashboardAnalytics> {
  const response = await api.get<DashboardAnalytics>(
    "/dashboard/analytics",
    { params: { period } },
  );

  return response.data;
}