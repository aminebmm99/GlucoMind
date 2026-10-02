import * as glucoseReadingRepository from "../repositories/glucose-reading.repository";

export interface GlucoseReadingData {
  glucoseValue: number;
  unit?: string;
  measuredAt: Date;
  context?: string;
  notes?: string;
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
    !ALLOWED_CONTEXTS.includes(data.context)
  ) {
    throw new Error("Invalid glucose context");
  }

  const existingReading =
    await glucoseReadingRepository.findById(id, userId);

  if (!existingReading) {
    throw new Error("Glucose reading not found");
  }

  await glucoseReadingRepository.update(
    id,
    userId,
    data,
  );

  return glucoseReadingRepository.findById(id, userId);
}

export async function deleteGlucoseReading(
  id: number,
  userId: number,
) {
  const existingReading =
    await glucoseReadingRepository.findById(id, userId);

  if (!existingReading) {
    throw new Error("Glucose reading not found");
  }

  await glucoseReadingRepository.remove(id, userId);
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