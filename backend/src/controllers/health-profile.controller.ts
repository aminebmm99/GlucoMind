import { Response } from "express";
import {
  AuthRequest,
} from "../middleware/auth.middleware";
import * as healthProfileService from "../services/health-profile.service";

function parseBody(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Request body must be a JSON object");
  }

  return value as Record<string, unknown>;
}

function parseOptionalDate(value: unknown): Date | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error("Invalid date");
  }

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]);
    const day = Number(dateOnly[3]);
    const calendarDate = new Date(Date.UTC(year, month - 1, day));

    if (
      calendarDate.getUTCFullYear() !== year ||
      calendarDate.getUTCMonth() !== month - 1 ||
      calendarDate.getUTCDate() !== day
    ) {
      throw new Error("Invalid date");
    }
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  return date;
}

function parseOptionalNumber(value: unknown): number | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  if (typeof value !== "number" && typeof value !== "string") {
    throw new Error("Invalid number");
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new Error("Invalid number");
  }

  return number;
}

function parseOptionalString(value: unknown, message: string): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error(message);
  }

  return value;
}

function getHealthProfileData(body: Record<string, unknown>) {
  return {
    dateOfBirth: parseOptionalDate(body.dateOfBirth),
    gender: parseOptionalString(body.gender, "Invalid gender"),
    height: parseOptionalNumber(body.height),
    weight: parseOptionalNumber(body.weight),
    diabetesType: parseOptionalString(body.diabetesType, "Invalid diabetes type"),
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

    const data = getHealthProfileData(parseBody(req.body));

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

    if (isValidationError(error)) {
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

    const data = getHealthProfileData(parseBody(req.body));

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

    if (isValidationError(error)) {
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

function isValidationError(error: unknown): error is Error {
  if (!(error instanceof Error)) return false;

  return [
    "Request body must be a JSON object",
    "Invalid date",
    "Invalid number",
    "Invalid gender",
    "Invalid diabetes type",
    "Height must be greater than 0",
    "Weight must be greater than 0",
    "Target glucose minimum must be greater than 0",
    "Target glucose maximum must be greater than 0",
    "Target glucose minimum cannot exceed maximum",
    "Date of birth cannot be in the future",
    "Diagnosis date cannot be in the future",
    "Diagnosis date cannot be before date of birth",
    "At least one profile field must be provided",
  ].includes(error.message);
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