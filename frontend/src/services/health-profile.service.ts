import { api } from "./api";
import type { HealthProfile } from "../types/api";

export interface HealthProfileData {
  dateOfBirth?: string;
  gender?: string;
  height?: number;
  weight?: number;
  diabetesType?: string;
  diagnosisDate?: string;
  targetGlucoseMin?: number;
  targetGlucoseMax?: number;
}

export async function getHealthProfile(): Promise<HealthProfile> {
  const response = await api.get<HealthProfile>(
    "/health-profile",
  );

  return response.data;
}

export async function createHealthProfile(
  data: HealthProfileData,
): Promise<HealthProfile> {
  const response = await api.post<HealthProfile>(
    "/health-profile",
    data,
  );

  return response.data;
}

export async function updateHealthProfile(
  data: HealthProfileData,
): Promise<HealthProfile> {
  const response = await api.put<HealthProfile>(
    "/health-profile",
    data,
  );

  return response.data;
}