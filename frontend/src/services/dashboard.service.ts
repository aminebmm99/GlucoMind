import { api } from "./api";
import type {
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
  period: "today" | "7d" | "30d",
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