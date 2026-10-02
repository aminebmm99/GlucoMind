import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export async function createUser(
  email: string,
  name: string | undefined,
  passwordHash: string,
) {
  return prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
    },
  });
}