import { Request, Response } from "express";
import { userService } from "../services/user.service";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function createUser(
  req: Request,
  res: Response,
) {
  try {
    const { email, name } = req.body;

    // Validate email
    if (typeof email !== "string" || email.trim() === "") {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Validate name if provided
    if (name !== undefined && typeof name !== "string") {
      return res.status(400).json({
        message: "Name must be a string",
      });
    }

    const user = await userService.createUser(
      email.trim(),
      name?.trim(),
    );

    return res.status(201).json(user);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
}

export async function getUser(
  req: Request,
  res: Response,
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await userService.getUserById(id);

    return res.json(user);
  } catch (error) {
    console.error(error);

    return res.status(404).json({
      message:
        error instanceof Error
          ? error.message
          : "User not found",
    });
  }
}
export async function updateUser(
  req: Request,
  res: Response,
) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const { email, name } = req.body;

    if (email === undefined && name === undefined) {
      return res.status(400).json({
        message: "At least one field is required",
      });
    }

    if (email !== undefined) {
      if (typeof email !== "string" || email.trim() === "") {
        return res.status(400).json({
          message: "Email must be a valid string",
        });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({
          message: "Invalid email format",
        });
      }
    }

    if (name !== undefined && typeof name !== "string") {
      return res.status(400).json({
        message: "Name must be a string",
      });
    }

    const user = await userService.updateUser(
      id,
      email !== undefined ? email.trim() : undefined,
      name !== undefined ? name.trim() : undefined,
    );

    return res.json(user);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong",
    });
  }
}