import { api } from "./api";
import type { GlucoseReading } from "../types/api";

export interface CreateGlucoseReadingData {
  glucoseValue: number;
  unit?: string;
  measuredAt: string;
  context?: string;
  notes?: string;
}

export interface UpdateGlucoseReadingData {
  glucoseValue?: number;
  unit?: string;
  measuredAt?: string;
  context?: string;
  notes?: string;
}

export async function getGlucoseReadings(): Promise<
  GlucoseReading[]
> {
  const response = await api.get<GlucoseReading[]>(
    "/glucose-readings",
  );

  return response.data;
}

export async function getGlucoseReading(
  id: number,
): Promise<GlucoseReading> {
  const response = await api.get<GlucoseReading>(
    `/glucose-readings/${id}`,
  );

  return response.data;
}

export async function createGlucoseReading(
  data: CreateGlucoseReadingData,
): Promise<GlucoseReading> {
  const response = await api.post<GlucoseReading>(
    "/glucose-readings",
    data,
  );

  return response.data;
}

export async function updateGlucoseReading(
  id: number,
  data: UpdateGlucoseReadingData,
): Promise<GlucoseReading> {
  const response = await api.put<GlucoseReading>(
    `/glucose-readings/${id}`,
    data,
  );

  return response.data;
}

export async function deleteGlucoseReading(
  id: number,
): Promise<void> {
  await api.delete(`/glucose-readings/${id}`);
}