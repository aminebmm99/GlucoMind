import { prisma } from "../prisma";
import { normalizeGlucoseToMgDl } from "../utils/glucose-units";

const glucoseReading = (prisma as any).glucoseReading;

export async function countReadings(userId: number) {
  return glucoseReading.count({
    where: {
      userId,
    },
  });
}

export async function getGlucoseStats(userId: number) {
  const groups = await glucoseReading.groupBy({
    by: ["unit"],
    where: { userId },
    _avg: { glucoseValue: true },
    _min: { glucoseValue: true },
    _max: { glucoseValue: true },
    _count: { _all: true },
  });

  let total = 0;
  let count = 0;
  let minimumGlucose: number | null = null;
  let maximumGlucose: number | null = null;

  for (const group of groups) {
    const averageMgDl = normalizeGlucoseToMgDl(group._avg.glucoseValue, group.unit);
    const minimumMgDl = normalizeGlucoseToMgDl(group._min.glucoseValue, group.unit);
    const maximumMgDl = normalizeGlucoseToMgDl(group._max.glucoseValue, group.unit);
    if (averageMgDl === null || minimumMgDl === null || maximumMgDl === null) continue;

    const groupCount = group._count._all;
    total += averageMgDl * groupCount;
    count += groupCount;
    minimumGlucose = minimumGlucose === null ? minimumMgDl : Math.min(minimumGlucose, minimumMgDl);
    maximumGlucose = maximumGlucose === null ? maximumMgDl : Math.max(maximumGlucose, maximumMgDl);
  }

  return {
    averageGlucose: count === 0 ? null : total / count,
    minimumGlucose,
    maximumGlucose,
  };
}

export async function getLatestReading(userId: number) {
  return glucoseReading.findFirst({
    where: {
      userId,
    },
    orderBy: {
      measuredAt: "desc",
    },
  });
}
export async function getReadings(
  userId: number,
  from?: Date,
  to?: Date,
) {
  return glucoseReading.findMany({
    where: {
      userId,
      ...(from || to
        ? {
            measuredAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    },
    orderBy: {
      measuredAt: "asc",
    },
  });
}