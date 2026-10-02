import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as authRepository from "../repositories/auth.repository";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config";

export async function register(
  email: string,
  name: string | undefined,
  password: string,
) {
  const existingUser =
    await authRepository.findUserByEmail(email);

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await authRepository.createUser(
    email,
    name,
    passwordHash,
  );

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

export async function login(
  email: string,
  password: string,
) {
  const user = (await authRepository.findUserByEmail(email)) as
    | {
        id: number;
        email: string;
        name: string | null;
        passwordHash: string;
      }
    | null;

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    },
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
}