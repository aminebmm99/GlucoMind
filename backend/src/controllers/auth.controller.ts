import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import {
  AuthRequest,
} from "../middleware/auth.middleware";
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function register(
  req: Request,
  res: Response,
) {
  try {
    const { email, name, password } = req.body;

    if (
      typeof email !== "string" ||
      email.trim() === ""
    ) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    if (
      typeof password !== "string" ||
      password.length < 8
    ) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters",
      });
    }

    if (
      name !== undefined &&
      typeof name !== "string"
    ) {
      return res.status(400).json({
        message: "Name must be a string",
      });
    }

    const user = await authService.register(
      email.trim(),
      name?.trim(),
      password,
    );

    return res.status(201).json(user);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Registration failed",
    });
  }
}

export async function login(
  req: Request,
  res: Response,
) {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      email.trim() === ""
    ) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (typeof password !== "string") {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    const result = await authService.login(
      email.trim(),
      password,
    );

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(401).json({
      message:
        error instanceof Error
          ? error.message
          : "Authentication failed",
    });
  }
}
export async function getMe(
  req: AuthRequest,
  res: Response,
) {
  return res.json({
    userId: req.user?.userId,
    email: req.user?.email,
  });
}