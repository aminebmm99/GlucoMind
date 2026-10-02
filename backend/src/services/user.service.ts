import { userRepository } from "../repositories/user.repository";

export const userService = {
  async createUser(email: string, name?: string) {
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    return userRepository.create(email, name);
  },

  async getUserById(id: number) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },

  async updateUser(id: number, name?: string) {
    await this.getUserById(id);

    return userRepository.update(id, name);
  },
};