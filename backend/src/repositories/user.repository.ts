import { prisma } from "../prisma";

export async function getUserById(id: number) {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}

export async function updateUser(
  id: number,
  data: {
    email?: string;
    name?: string;
  },
) {
  return prisma.user.update({
    where: {
      id,
    },
    data,
  });
}

export async function deleteUser(id: number) {
  return prisma.user.delete({
    where: {
      id,
    },
  });
}