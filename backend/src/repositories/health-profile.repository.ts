import { prisma } from "../prisma";

const prismaClient = prisma as any;

export async function findByUserId(userId: number) {
  return prismaClient.healthProfile.findUnique({
    where: {
      userId,
    },
  });
}

export async function create(
  userId: number,
  data: {
    dateOfBirth?: Date | null;
    gender?: string | null;
    height?: number | null;
    weight?: number | null;
    diabetesType?: string | null;
    diagnosisDate?: Date | null;
    targetGlucoseMin?: number | null;
    targetGlucoseMax?: number | null;
  },
) {
  return prismaClient.healthProfile.create({
    data: {
      ...data,
      userId,
    },
  });
}

export async function update(
  userId: number,
  data: {
    dateOfBirth?: Date | null;
    gender?: string | null;
    height?: number | null;
    weight?: number | null;
    diabetesType?: string | null;
    diagnosisDate?: Date | null;
    targetGlucoseMin?: number | null;
    targetGlucoseMax?: number | null;
  },
) {
  return prismaClient.healthProfile.updateMany({
    where: { userId },
    data,
  });
}

export async function remove(userId: number) {
  return prismaClient.healthProfile.deleteMany({ where: { userId } });
}