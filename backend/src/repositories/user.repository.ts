import { prisma } from "../prisma";

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  create(email: string, name?: string) {
    return prisma.user.create({
      data: {
        email,
        name,
      },
    });
  },

  update(id: number, name?: string) {
    return prisma.user.update({
      where: { id },
      data: {
        name,
      },
    });
  },
};
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
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
}
export async function deleteUser(id: number) {
  return prisma.user.delete({
    where: {
      id,
    },
  });
}