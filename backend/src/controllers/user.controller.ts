import { Request, Response } from "express";
import { userService } from "../services/user.service";

export async function createUser(
  req: Request,
  res: Response,
) {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await userService.createUser(email, name);

    return res.status(201).json(user);
  } catch (error) {
    console.error(error);

    return res.status(400).json({
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
}

export async function getUser(
  req: Request,
  res: Response,
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const user = await userService.getUserById(id);

    return res.json(user);
  } catch (error) {
    console.error(error);

    return res.status(404).json({
      message: error instanceof Error ? error.message : "User not found",
    });
  }
}