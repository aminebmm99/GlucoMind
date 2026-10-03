import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as glucoseReadingService from "../services/glucose-reading.service";

function parseDate(value: unknown): Date {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error("Measurement date is required");
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid measurement date");
  }

  return date;
}

function parseBody(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Request body must be a JSON object");
  }

  return value as Record<string, unknown>;
}

function parseGlucoseValue(value: unknown): number {
  const glucoseValue = Number(value);

  if (
    value === undefined ||
    value === null ||
    value === "" ||
    !Number.isFinite(glucoseValue)
  ) {
    throw new Error("Glucose value must be a valid number");
  }

  return glucoseValue;
}

function parseCreateData(body: Record<string, unknown>) {
  if (body.unit !== undefined && typeof body.unit !== "string") {
    throw new Error("Invalid glucose unit");
  }

  if (body.context !== undefined && body.context !== null && typeof body.context !== "string") {
    throw new Error("Invalid glucose context");
  }

  if (body.notes !== undefined && body.notes !== null && typeof body.notes !== "string") {
    throw new Error("Invalid notes");
  }

  return {
    glucoseValue: parseGlucoseValue(body.glucoseValue),
    unit:
      typeof body.unit === "string"
        ? body.unit
        : undefined,
    measuredAt: parseDate(body.measuredAt),
    context: typeof body.context === "string" ? body.context : undefined,
    notes: typeof body.notes === "string" ? body.notes : undefined,
  };
}

function parseUpdateData(body: Record<string, unknown>) {
  const data: {
    glucoseValue?: number;
    unit?: string;
    measuredAt?: Date;
    context?: string | null;
    notes?: string | null;
  } = {};

  if (body.glucoseValue !== undefined) {
    data.glucoseValue = parseGlucoseValue(
      body.glucoseValue,
    );
  }

  if (body.unit !== undefined) {
    if (typeof body.unit !== "string") {
      throw new Error("Invalid glucose unit");
    }

    data.unit = body.unit;
  }

  if (body.measuredAt !== undefined) {
    data.measuredAt = parseDate(body.measuredAt);
  }

  if (body.context !== undefined) {
    if (body.context !== null && typeof body.context !== "string") {
      throw new Error("Invalid glucose context");
    }

    data.context = body.context as string | null;
  }

  if (body.notes !== undefined) {
    if (
      body.notes !== null &&
      typeof body.notes !== "string"
    ) {
      throw new Error("Invalid notes");
    }

    data.notes = body.notes as string | null;
  }

  return data;
}

function parseId(value: string | string[] | undefined): number {
  const normalizedValue = Array.isArray(value)
    ? value[0]
    : value;

  const id = Number(normalizedValue);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid reading ID");
  }

  return id;
}

export async function createGlucoseReading(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = req.user!.userId;

    const data = parseCreateData(parseBody(req.body));

    const reading =
      await glucoseReadingService.createGlucoseReading(
        userId,
        data,
      );

    return res.status(201).json(reading);
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes("Glucose value") ||
        error.message.includes("date") ||
        error.message.includes("context") ||
        error.message.includes("unit") ||
        error.message.includes("notes") ||
        error.message.includes("Request body")
      ) {
        return res.status(400).json({
          message: error.message,
        });
      }
    }

    console.error(error);

    return res.status(500).json({
      message: "Failed to create glucose reading",
    });
  }
}

export async function getGlucoseReadings(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = req.user!.userId;

    const readings =
      await glucoseReadingService.getGlucoseReadings(
        userId,
      );

    return res.json(readings);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get glucose readings",
    });
  }
}

export async function getGlucoseReading(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = req.user!.userId;
    const id = parseId(req.params.id);

    const reading =
      await glucoseReadingService.getGlucoseReading(
        id,
        userId,
      );

    return res.json(reading);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Glucose reading not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message === "Invalid reading ID"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Failed to get glucose reading",
    });
  }
}

export async function updateGlucoseReading(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = req.user!.userId;
    const id = parseId(req.params.id);

    const data = parseUpdateData(parseBody(req.body));

    const reading =
      await glucoseReadingService.updateGlucoseReading(
        id,
        userId,
        data,
      );

    return res.json(reading);
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "Glucose reading not found"
      ) {
        return res.status(404).json({
          message: error.message,
        });
      }

      if (
        error.message.includes("Glucose value") ||
        error.message.includes("date") ||
        error.message.includes("context") ||
        error.message.includes("unit") ||
        error.message.includes("notes")
      ) {
        return res.status(400).json({
          message: error.message,
        });
      }

      if (
        error.message === "Invalid reading ID"
      ) {
        return res.status(400).json({
          message: error.message,
        });
      }

      if (error.message === "Request body must be a JSON object") {
        return res.status(400).json({ message: error.message });
      }

      if (error.message === "At least one reading field must be provided") {
        return res.status(400).json({ message: error.message });
      }
    }

    console.error(error);

    return res.status(500).json({
      message: "Failed to update glucose reading",
    });
  }
}

export async function deleteGlucoseReading(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = req.user!.userId;
    const id = parseId(req.params.id);

    await glucoseReadingService.deleteGlucoseReading(
      id,
      userId,
    );

    return res.status(204).send();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Glucose reading not found"
    ) {
      return res.status(404).json({
        message: error.message,
      });
    }

    if (
      error instanceof Error &&
      error.message === "Invalid reading ID"
    ) {
      return res.status(400).json({
        message: error.message,
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Failed to delete glucose reading",
    });
  }
}