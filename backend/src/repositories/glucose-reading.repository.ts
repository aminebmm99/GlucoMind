import { prisma } from "../prisma";

const prismaClient = prisma as any;

export async function create(
  userId: number,
  data: {
    glucoseValue: number;
    unit?: string;
    measuredAt: Date;
    context?: string | null;
    notes?: string | null;
  },
) {
  return prismaClient.glucoseReading.create({
    data: {
      ...data,
      // Keep ownership authoritative even if extra fields reach this layer.
      userId,
    },
  });
}

export async function findById(
  id: number,
  userId: number,
) {
  return prismaClient.glucoseReading.findFirst({
    where: {
      id,
      userId,
    },
  });
}

export async function findByUserId(
  userId: number,
) {
  return prismaClient.glucoseReading.findMany({
    where: {
      userId,
    },
    orderBy: {
      measuredAt: "desc",
    },
  });
}

export async function update(
  id: number,
  userId: number,
  data: {
    glucoseValue?: number;
    unit?: string;
    measuredAt?: Date;
    context?: string | null;
    notes?: string | null;
  },
) {
  return prismaClient.glucoseReading.updateMany({
    where: {
      id,
      userId,
    },
    data,
  });
}

export async function remove(
  id: number,
  userId: number,
) {
  return prismaClient.glucoseReading.deleteMany({
    where: {
      id,
      userId,
    },
  });
}