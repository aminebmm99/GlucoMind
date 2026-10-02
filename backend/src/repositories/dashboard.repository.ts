import { prisma } from "../prisma";

const glucoseReading = (prisma as any).glucoseReading;

export async function countReadings(userId: number) {
  return glucoseReading.count({
    where: {
      userId,
    },
  });
}

export async function getAverageGlucose(userId: number) {
  const result = await glucoseReading.aggregate({
    where: {
      userId,
    },
    _avg: {
      glucoseValue: true,
    },
  });

  return result._avg.glucoseValue;
}

export async function getMinMaxGlucose(userId: number) {
  const result = await glucoseReading.aggregate({
    where: {
      userId,
    },
    _min: {
      glucoseValue: true,
    },
    _max: {
      glucoseValue: true,
    },
  });

  return {
    minimumGlucose: result._min.glucoseValue,
    maximumGlucose: result._max.glucoseValue,
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