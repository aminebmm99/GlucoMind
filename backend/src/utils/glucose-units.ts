export const MMOL_TO_MGDL = 18.0182;

export function normalizeGlucoseToMgDl(
  value: number,
  unit: string,
): number | null {
  if (unit === "mg/dL") {
    return value;
  }

  if (unit === "mmol/L") {
    return value * MMOL_TO_MGDL;
  }

  return null;
}