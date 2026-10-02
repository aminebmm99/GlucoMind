import * as dashboardRepository from "../repositories/dashboard.repository";

export async function getDashboardSummary(userId: number) {
  const [
    totalReadings,
    averageGlucose,
    minMax,
    latestReading,
  ] = await Promise.all([
    dashboardRepository.countReadings(userId),
    dashboardRepository.getAverageGlucose(userId),
    dashboardRepository.getMinMaxGlucose(userId),
    dashboardRepository.getLatestReading(userId),
  ]);

  return {
    totalReadings,
    averageGlucose,
    minimumGlucose: minMax.minimumGlucose,
    maximumGlucose: minMax.maximumGlucose,
    latestReading,
  };
}
export async function getDashboardReadings(
  userId: number,
  from?: Date,
  to?: Date,
) {
  return dashboardRepository.getReadings(
    userId,
    from,
    to,
  );
}

export async function getDashboardPeriod(
  userId: number,
  period: "today" | "7d" | "30d",
) {
  const now = new Date();
  const from = new Date(now);

  if (period === "today") {
    from.setHours(0, 0, 0, 0);
  } else if (period === "7d") {
    from.setDate(from.getDate() - 7);
  } else if (period === "30d") {
    from.setDate(from.getDate() - 30);
  }

  const readings = await dashboardRepository.getReadings(
    userId,
    from,
    now,
  );

  if (readings.length === 0) {
    return {
      period,
      totalReadings: 0,
      averageGlucose: null,
      minimumGlucose: null,
      maximumGlucose: null,
      readings: [],
    };
  }

  const values = readings.map(
    (reading: { glucoseValue: any; }) => reading.glucoseValue,
  );

  const total = values.reduce(
    (sum: any, value: any) => sum + value,
    0,
  );

  return {
    period,
    totalReadings: readings.length,
    averageGlucose: total / values.length,
    minimumGlucose: Math.min(...values),
    maximumGlucose: Math.max(...values),
    readings,
  };
}
