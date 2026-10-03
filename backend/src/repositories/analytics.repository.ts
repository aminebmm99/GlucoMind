import { prisma } from "../prisma";

const prismaClient = prisma as any;

export interface AnalyticsReading {
  glucoseValue: number;
  unit: string;
  measuredAt: Date;
}

export interface AnalyticsTargetRange {
  targetGlucoseMin: number | null;
  targetGlucoseMax: number | null;
}

export async function getReadingsForWindow(
  userId: number,
  from: Date,
  to: Date,
): Promise<AnalyticsReading[]> {
  return prismaClient.glucoseReading.findMany({
    where: {
      userId,
      unit: { in: ["mg/dL", "mmol/L"] },
      measuredAt: { gte: from, lte: to },
    },
    select: {
      glucoseValue: true,
      unit: true,
      measuredAt: true,
    },
    orderBy: { measuredAt: "asc" },
  });
}

export async function getTargetRange(
  userId: number,
): Promise<AnalyticsTargetRange | null> {
  return prismaClient.healthProfile.findUnique({
    where: { userId },
    select: {
      targetGlucoseMin: true,
      targetGlucoseMax: true,
    },
  });
}