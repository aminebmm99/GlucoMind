import { userRepository } from "../repositories/user.repository";

export const userService = {
  async createUser(email: string, name?: string) {
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const createUserFn = (userRepository as any).createUser ?? (userRepository as any).create;

    if (typeof createUserFn !== "function") {
      throw new Error("User repository does not support creating users");
    }

    return createUserFn.call(userRepository, email, name);
  },

  async getUserById(id: number) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },

  async updateUser(id: number, name?: string, p0?: any) {
    await this.getUserById(id);

    return userRepository.update(id, name);
  },
};
export async function updateUser(
  id: number,
  data: {
    email?: string;
    name?: string;
  },
) {
  const existingUser = await userRepository.findById(id);

  if (!existingUser) {
    throw new Error("User not found");
  }

  if (data.email) {
    const userWithEmail = await userRepository.findByEmail(data.email);

    if (userWithEmail && userWithEmail.id !== id) {
      throw new Error("User with this email already exists");
    }
  }

  return userRepository.update(id, data.name);
}
export async function deleteUser(id: number) {
  const existingUser = await userRepository.findById(id);

  if (!existingUser) {
    throw new Error("User not found");
  }

  const deleteUserFn =
    (userRepository as any).deleteUser ??
    (userRepository as any).delete ??
    (userRepository as any).remove;

  if (typeof deleteUserFn !== "function") {
    throw new Error("User repository does not support deleting users");
  }

  return deleteUserFn.call(userRepository, id);
}