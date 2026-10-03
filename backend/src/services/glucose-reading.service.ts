import * as glucoseReadingRepository from "../repositories/glucose-reading.repository";

export interface GlucoseReadingData {
  glucoseValue: number;
  unit?: string;
  measuredAt: Date;
  context?: string | null;
  notes?: string | null;
}

const ALLOWED_CONTEXTS = [
  "BEFORE_MEAL",
  "AFTER_MEAL",
  "FASTING",
  "BEDTIME",
  "RANDOM",
];

export async function createGlucoseReading(
  userId: number,
  data: GlucoseReadingData,
) {
  validateGlucoseReading(data);

  return glucoseReadingRepository.create(userId, data);
}

export async function getGlucoseReadings(userId: number) {
  return glucoseReadingRepository.findByUserId(userId);
}

export async function getGlucoseReading(
  id: number,
  userId: number,
) {
  const reading =
    await glucoseReadingRepository.findById(id, userId);

  if (!reading) {
    throw new Error("Glucose reading not found");
  }

  return reading;
}

export async function updateGlucoseReading(
  id: number,
  userId: number,
  data: Partial<GlucoseReadingData>,
) {
  if (data.glucoseValue !== undefined) {
    if (
      typeof data.glucoseValue !== "number" ||
      !Number.isFinite(data.glucoseValue) ||
      data.glucoseValue <= 0
    ) {
      throw new Error("Glucose value must be greater than 0");
    }
  }

  if (data.measuredAt !== undefined) {
    if (
      !(data.measuredAt instanceof Date) ||
      Number.isNaN(data.measuredAt.getTime())
    ) {
      throw new Error("Invalid measurement date");
    }
  }

  if (
    data.context !== undefined &&
    data.context !== null &&
    !ALLOWED_CONTEXTS.includes(data.context)
  ) {
    throw new Error("Invalid glucose context");
  }

  if (
    data.unit !== undefined &&
    data.unit !== "mg/dL" &&
    data.unit !== "mmol/L"
  ) {
    throw new Error("Invalid glucose unit");
  }

  if (Object.keys(data).length === 0) {
    throw new Error("At least one reading field must be provided");
  }

  const result = await glucoseReadingRepository.update(
    id,
    userId,
    data,
  );

  if (result.count === 0) {
    throw new Error("Glucose reading not found");
  }

  return glucoseReadingRepository.findById(id, userId);
}

export async function deleteGlucoseReading(
  id: number,
  userId: number,
) {
  const result = await glucoseReadingRepository.remove(id, userId);

  if (result.count === 0) {
    throw new Error("Glucose reading not found");
  }
}

function validateGlucoseReading(
  data: GlucoseReadingData,
) {
  if (
    typeof data.glucoseValue !== "number" ||
    !Number.isFinite(data.glucoseValue) ||
    data.glucoseValue <= 0
  ) {
    throw new Error("Glucose value must be greater than 0");
  }

  if (
    !(data.measuredAt instanceof Date) ||
    Number.isNaN(data.measuredAt.getTime())
  ) {
    throw new Error("Invalid measurement date");
  }

  if (
    data.context !== undefined &&
    data.context !== null &&
    !ALLOWED_CONTEXTS.includes(data.context)
  ) {
    throw new Error("Invalid glucose context");
  }

  if (
    data.unit !== undefined &&
    data.unit !== "mg/dL" &&
    data.unit !== "mmol/L"
  ) {
    throw new Error("Invalid glucose unit");
  }
}