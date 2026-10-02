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