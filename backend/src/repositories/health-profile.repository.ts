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
    dateOfBirth?: Date;
    gender?: string;
    height?: number;
    weight?: number;
    diabetesType?: string;
    diagnosisDate?: Date;
    targetGlucoseMin?: number;
    targetGlucoseMax?: number;
  },
) {
  return prismaClient.healthProfile.create({
    data: {
      userId,
      ...data,
    },
  });
}

export async function update(
  userId: number,
  data: {
    dateOfBirth?: Date;
    gender?: string;
    height?: number;
    weight?: number;
    diabetesType?: string;
    diagnosisDate?: Date;
    targetGlucoseMin?: number;
    targetGlucoseMax?: number;
  },
) {
  return prismaClient.healthProfile.update({
    where: {
      userId,
    },
    data,
  });
}

export async function remove(userId: number) {
  return prismaClient.healthProfile.delete({
    where: {
      userId,
    },
  });
}