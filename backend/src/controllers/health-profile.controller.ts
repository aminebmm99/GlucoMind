import { Response } from "express";
import {
  AuthRequest,
} from "../middleware/auth.middleware";
import * as healthProfileService from "../services/health-profile.service";

function parseOptionalDate(value: unknown): Date | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  return date;
}

function parseOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new Error("Invalid number");
  }

  return number;
}

function getHealthProfileData(body: Record<string, unknown>) {
  return {
    dateOfBirth: parseOptionalDate(body.dateOfBirth),
    gender:
      typeof body.gender === "string"
        ? body.gender
        : undefined,
    height: parseOptionalNumber(body.height),
    weight: parseOptionalNumber(body.weight),
    diabetesType:
      typeof body.diabetesType === "string"
        ? body.diabetesType
        : undefined,
    diagnosisDate: parseOptionalDate(body.diagnosisDate),
    targetGlucoseMin: parseOptionalNumber(
      body.targetGlucoseMin,
    ),
    targetGlucoseMax: parseOptionalNumber(
      body.targetGlucoseMax,
    ),
  };
}

export async function getHealthProfile(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = req.user!.userId;

    const profile =
      await healthProfileService.getHealthProfile(userId);

    if (!profile) {
      return res.status(404).json({
        message: "Health profile not found",
      });
    }

    return res.json(profile);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get health profile",
    });
  }
}

export async function createHealthProfile(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = req.user!.userId;

    const data = getHealthProfileData(req.body);

    const profile =
      await healthProfileService.createHealthProfile(
        userId,
        data,
      );

    return res.status(201).json(profile);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Health profile already exists"
    ) {
      return res.status(409).json({
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message === "Invalid date"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message === "Invalid number"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Failed to create health profile",
    });
  }
}

export async function updateHealthProfile(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = req.user!.userId;

    const data = getHealthProfileData(req.body);

    const profile =
      await healthProfileService.updateHealthProfile(
        userId,
        data,
      );

    return res.json(profile);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Health profile not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message === "Invalid date"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message === "Invalid number"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Failed to update health profile",
    });
  }
}

export async function deleteHealthProfile(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = req.user!.userId;

    await healthProfileService.deleteHealthProfile(userId);

    return res.status(204).send();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Health profile not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Failed to delete health profile",
    });
  }
}