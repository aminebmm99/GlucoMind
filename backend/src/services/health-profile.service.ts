import * as healthProfileRepository from "../repositories/health-profile.repository";

export interface HealthProfileData {
  dateOfBirth?: Date;
  gender?: string;
  height?: number;
  weight?: number;
  diabetesType?: string;
  diagnosisDate?: Date;
  targetGlucoseMin?: number;
  targetGlucoseMax?: number;
}

export async function getHealthProfile(userId: number) {
  return healthProfileRepository.findByUserId(userId);
}

export async function createHealthProfile(
  userId: number,
  data: HealthProfileData,
) {
  const existingProfile =
    await healthProfileRepository.findByUserId(userId);

  if (existingProfile) {
    throw new Error("Health profile already exists");
  }

  return healthProfileRepository.create(userId, data);
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

  return healthProfileRepository.update(userId, data);
}

export async function deleteHealthProfile(userId: number) {
  const existingProfile =
    await healthProfileRepository.findByUserId(userId);

  if (!existingProfile) {
    throw new Error("Health profile not found");
  }

  return healthProfileRepository.remove(userId);
}