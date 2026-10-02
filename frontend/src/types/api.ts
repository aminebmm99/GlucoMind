export interface User {
  id: number;
  email: string;
  name: string;
}

export interface HealthProfile {
  id: number;
  userId: number;
  dateOfBirth?: string | null;
  gender?: string | null;
  height?: number | null;
  weight?: number | null;
  diabetesType?: string | null;
  diagnosisDate?: string | null;
  targetGlucoseMin?: number | null;
  targetGlucoseMax?: number | null;
}

export interface GlucoseReading {
  id: number;
  userId: number;
  glucoseValue: number;
  unit: string;
  measuredAt: string;
  context?: string | null;
  notes?: string | null;
}

export interface DashboardSummary {
  totalReadings: number;
  averageGlucose: number | null;
  minimumGlucose: number | null;
  maximumGlucose: number | null;
  latestReading: GlucoseReading | null;
}