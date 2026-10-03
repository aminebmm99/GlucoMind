import * as healthProfileRepository from "../repositories/health-profile.repository";

export interface HealthProfileData {
  dateOfBirth?: Date | null;
  gender?: string | null;
  height?: number | null;
  weight?: number | null;
  diabetesType?: string | null;
  diagnosisDate?: Date | null;
  targetGlucoseMin?: number | null;
  targetGlucoseMax?: number | null;
}

const ALLOWED_GENDERS = ["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"];
const ALLOWED_DIABETES_TYPES = ["TYPE_1", "TYPE_2", "GESTATIONAL", "OTHER"];

export async function getHealthProfile(userId: number) {
  return healthProfileRepository.findByUserId(userId);
}

export async function createHealthProfile(
  userId: number,
  data: HealthProfileData,
) {
  validateHealthProfile(data);

  try {
    return await healthProfileRepository.create(userId, data);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      throw new Error("Health profile already exists");
    }

    throw error;
  }
}

export async function updateHealthProfile(
  userId: number,
  data: HealthProfileData,
) {
  const existingProfile =
    await healthProfileRepository.findByUserId(userId);

  if (!existingProfile) {
    throw new Error("Health profile not found");
  }

  if (Object.values(data).every((value) => value === undefined)) {
    throw new Error("At least one profile field must be provided");
  }

  const effectiveData: HealthProfileData = {
    dateOfBirth: data.dateOfBirth === undefined ? existingProfile.dateOfBirth : data.dateOfBirth,
    gender: data.gender === undefined ? existingProfile.gender : data.gender,
    height: data.height === undefined ? existingProfile.height : data.height,
    weight: data.weight === undefined ? existingProfile.weight : data.weight,
    diabetesType: data.diabetesType === undefined ? existingProfile.diabetesType : data.diabetesType,
    diagnosisDate: data.diagnosisDate === undefined ? existingProfile.diagnosisDate : data.diagnosisDate,
    targetGlucoseMin: data.targetGlucoseMin === undefined ? existingProfile.targetGlucoseMin : data.targetGlucoseMin,
    targetGlucoseMax: data.targetGlucoseMax === undefined ? existingProfile.targetGlucoseMax : data.targetGlucoseMax,
  };
  validateHealthProfile(effectiveData);

  const result = await healthProfileRepository.update(userId, data);
  if (result.count === 0) {
    throw new Error("Health profile not found");
  }

  return healthProfileRepository.findByUserId(userId);
}

export async function deleteHealthProfile(userId: number) {
  const result = await healthProfileRepository.remove(userId);
  if (result.count === 0) {
    throw new Error("Health profile not found");
  }
}

function validateHealthProfile(data: HealthProfileData) {
  if (data.gender != null && !ALLOWED_GENDERS.includes(data.gender)) {
    throw new Error("Invalid gender");
  }

  if (data.diabetesType != null && !ALLOWED_DIABETES_TYPES.includes(data.diabetesType)) {
    throw new Error("Invalid diabetes type");
  }

  for (const [field, value] of [
    ["Height", data.height],
    ["Weight", data.weight],
    ["Target glucose minimum", data.targetGlucoseMin],
    ["Target glucose maximum", data.targetGlucoseMax],
  ] as const) {
    if (value != null && (!Number.isFinite(value) || value <= 0)) {
      throw new Error(`${field} must be greater than 0`);
    }
  }

  if (
    data.targetGlucoseMin != null &&
    data.targetGlucoseMax != null &&
    data.targetGlucoseMin > data.targetGlucoseMax
  ) {
    throw new Error("Target glucose minimum cannot exceed maximum");
  }

  const now = Date.now();
  if (data.dateOfBirth != null && data.dateOfBirth.getTime() > now) {
    throw new Error("Date of birth cannot be in the future");
  }

  if (data.diagnosisDate != null && data.diagnosisDate.getTime() > now) {
    throw new Error("Diagnosis date cannot be in the future");
  }

  if (
    data.dateOfBirth != null &&
    data.diagnosisDate != null &&
    data.diagnosisDate < data.dateOfBirth
  ) {
    throw new Error("Diagnosis date cannot be before date of birth");
  }
}