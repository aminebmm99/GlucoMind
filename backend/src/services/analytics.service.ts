import * as analyticsRepository from "../repositories/analytics.repository";
import { normalizeGlucoseToMgDl } from "../utils/glucose-units";

export type AnalyticsPeriod = "today" | "7d" | "14d" | "30d";
export type GlucoseTrend =
  | "INCREASING"
  | "DECREASING"
  | "STABLE"
  | "INSUFFICIENT_DATA";

interface NormalizedReading {
  glucoseMgDl: number;
  measuredAt: Date;
}

interface PeriodMetrics {
  readingCount: number;
  average: number | null;
  minimum: number | null;
  maximum: number | null;
  belowTarget: number | null;
  inTarget: number | null;
  aboveTarget: number | null;
  timeInRange: number | null;
}

interface AnalyticsInsight {
  id: string;
  type: "TREND" | "TIME_IN_RANGE" | "COMPARISON" | "DATA_AVAILABILITY";
  severity: "INFO" | "OBSERVATION";
  title: string;
  description: string;
  value: number | null;
  unit: string | null;
}

const SIGNIFICANT_TARGET_SHARE_PERCENT = 25;

function roundToOneDecimal(value: number): number {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

function getPeriodDays(period: AnalyticsPeriod): number {
  if (period === "today") return 1;
  return Number.parseInt(period, 10);
}

function getPeriodLabel(period: AnalyticsPeriod): string {
  return period === "today" ? "Today" : `Last ${period.slice(0, -1)} days`;
}

function validTargetRange(
  profile: analyticsRepository.AnalyticsTargetRange | null,
): { minimum: number; maximum: number } | null {
  const minimum = profile?.targetGlucoseMin;
  const maximum = profile?.targetGlucoseMax;

  if (
    minimum == null ||
    maximum == null ||
    !Number.isFinite(minimum) ||
    !Number.isFinite(maximum) ||
    minimum <= 0 ||
    minimum > maximum
  ) {
    return null;
  }

  return { minimum, maximum };
}

function summarize(
  readings: NormalizedReading[],
  targetRange: { minimum: number; maximum: number } | null,
): PeriodMetrics {
  const values = readings.map((reading) => reading.glucoseMgDl);
  const readingCount = values.length;

  if (readingCount === 0) {
    return {
      readingCount: 0,
      average: null,
      minimum: null,
      maximum: null,
      belowTarget: targetRange ? 0 : null,
      inTarget: targetRange ? 0 : null,
      aboveTarget: targetRange ? 0 : null,
      timeInRange: null,
    };
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  const belowTarget = targetRange
    ? values.filter((value) => value < targetRange.minimum).length
    : null;
  const inTarget = targetRange
    ? values.filter(
        (value) => value >= targetRange.minimum && value <= targetRange.maximum,
      ).length
    : null;
  const aboveTarget = targetRange
    ? values.filter((value) => value > targetRange.maximum).length
    : null;

  return {
    readingCount,
    average: total / readingCount,
    minimum: Math.min(...values),
    maximum: Math.max(...values),
    belowTarget,
    inTarget,
    aboveTarget,
    timeInRange: inTarget === null
      ? null
      : roundToOneDecimal((inTarget / readingCount) * 100),
  };
}

function determineTrend(
  readings: NormalizedReading[],
  from: Date,
  to: Date,
): { trend: GlucoseTrend; change: number | null } {
  const midpoint = from.getTime() + (to.getTime() - from.getTime()) / 2;
  const firstHalf = readings.filter(
    (reading) => reading.measuredAt.getTime() < midpoint,
  );
  const secondHalf = readings.filter(
    (reading) => reading.measuredAt.getTime() >= midpoint,
  );

  if (firstHalf.length < 2 || secondHalf.length < 2) {
    return { trend: "INSUFFICIENT_DATA", change: null };
  }

  const firstAverage =
    firstHalf.reduce((sum, reading) => sum + reading.glucoseMgDl, 0) /
    firstHalf.length;
  const secondAverage =
    secondHalf.reduce((sum, reading) => sum + reading.glucoseMgDl, 0) /
    secondHalf.length;
  const change = secondAverage - firstAverage;
  const stableThreshold = Math.max(5, firstAverage * 0.05);

  if (Math.abs(change) <= stableThreshold) {
    return { trend: "STABLE", change: roundToOneDecimal(change) };
  }

  return {
    trend: change > 0 ? "INCREASING" : "DECREASING",
    change: roundToOneDecimal(change),
  };
}

function createInsights(input: {
  periodLabel: string;
  metrics: PeriodMetrics;
  targetRange: { minimum: number; maximum: number } | null;
  trend: GlucoseTrend;
  trendChange: number | null;
  comparison: {
    previousPeriodLabel: string;
    previousReadingCount: number;
    readingCountChange: number;
    averageChange: number | null;
    averageChangePercent: number | null;
    timeInRangeChange: number | null;
  } | null;
}): AnalyticsInsight[] {
  const { periodLabel, metrics, targetRange, trend, trendChange, comparison } = input;
  const insights: AnalyticsInsight[] = [];

  if (metrics.readingCount === 0) {
    insights.push({
      id: "no-current-readings",
      type: "DATA_AVAILABILITY",
      severity: "INFO",
      title: "No readings in this period",
      description: `No supported glucose readings were recorded for ${periodLabel.toLowerCase()}. Period metrics are unavailable.`,
      value: 0,
      unit: "readings",
    });
  }

  if (trend === "INSUFFICIENT_DATA") {
    insights.push({
      id: "trend-insufficient-data",
      type: "DATA_AVAILABILITY",
      severity: "INFO",
      title: "Not enough readings to estimate a trend",
      description: "Trend estimates require at least two readings in each half of the selected period.",
      value: metrics.readingCount,
      unit: "readings",
    });
  } else {
    const trendDescription = trend === "STABLE"
      ? `The first and second halves differed by ${Math.abs(trendChange ?? 0).toFixed(1)} mg/dL, within the stability threshold of 5 mg/dL or 5% of the first-half average.`
      : `The average in the second half was ${Math.abs(trendChange ?? 0).toFixed(1)} mg/dL ${trend === "INCREASING" ? "higher" : "lower"} than in the first half.`;

    insights.push({
      id: "period-trend",
      type: "TREND",
      severity: "OBSERVATION",
      title: `Recorded glucose is ${trend.toLowerCase()}`,
      description: trendDescription,
      value: trendChange,
      unit: "mg/dL",
    });
  }

  if (!targetRange) {
    insights.push({
      id: "target-range-unavailable",
      type: "DATA_AVAILABILITY",
      severity: "INFO",
      title: "Time in range is unavailable",
      description: "Set both target glucose bounds in your health profile to calculate time in range.",
      value: null,
      unit: null,
    });
  } else if (metrics.readingCount > 0) {
    insights.push({
      id: "time-in-range-summary",
      type: "TIME_IN_RANGE",
      severity: "OBSERVATION",
      title: "Readings compared with your target range",
      description: `${metrics.inTarget} of ${metrics.readingCount} readings (${metrics.timeInRange?.toFixed(1)}%) were within your configured range; ${metrics.belowTarget} were below and ${metrics.aboveTarget} were above.`,
      value: metrics.timeInRange,
      unit: "%",
    });

    const belowPercent = ((metrics.belowTarget ?? 0) / metrics.readingCount) * 100;
    const abovePercent = ((metrics.aboveTarget ?? 0) / metrics.readingCount) * 100;

    if (belowPercent >= SIGNIFICANT_TARGET_SHARE_PERCENT) {
      insights.push({
        id: "significant-below-target-share",
        type: "TIME_IN_RANGE",
        severity: "OBSERVATION",
        title: "A notable share of readings were below target",
        description: `${metrics.belowTarget} of ${metrics.readingCount} readings (${roundToOneDecimal(belowPercent)}%) were below your configured lower target. This is a descriptive summary, not a medical assessment.`,
        value: roundToOneDecimal(belowPercent),
        unit: "%",
      });
    }

    if (abovePercent >= SIGNIFICANT_TARGET_SHARE_PERCENT) {
      insights.push({
        id: "significant-above-target-share",
        type: "TIME_IN_RANGE",
        severity: "OBSERVATION",
        title: "A notable share of readings were above target",
        description: `${metrics.aboveTarget} of ${metrics.readingCount} readings (${roundToOneDecimal(abovePercent)}%) were above your configured upper target. This is a descriptive summary, not a medical assessment.`,
        value: roundToOneDecimal(abovePercent),
        unit: "%",
      });
    }
  }

  if (comparison) {
    const averageText = comparison.averageChange === null
      ? "An average change could not be calculated."
      : `Average glucose changed by ${comparison.averageChange > 0 ? "+" : ""}${comparison.averageChange.toFixed(1)} mg/dL${comparison.averageChangePercent === null ? "" : ` (${comparison.averageChangePercent > 0 ? "+" : ""}${comparison.averageChangePercent.toFixed(1)}%)`} compared with the previous equivalent period.`;
    const rangeText = comparison.timeInRangeChange === null
      ? " Time-in-range change is unavailable without a configured target range and readings in both periods."
      : ` Time in range changed by ${comparison.timeInRangeChange > 0 ? "+" : ""}${comparison.timeInRangeChange.toFixed(1)} percentage points.`;

    insights.push({
      id: "period-comparison",
      type: "COMPARISON",
      severity: "INFO",
      title: "Compared with the previous period",
      description: `${averageText}${rangeText} Reading count changed by ${comparison.readingCountChange > 0 ? "+" : ""}${comparison.readingCountChange}.`,
      value: comparison.averageChange,
      unit: "mg/dL",
    });
  } else if (metrics.readingCount > 0) {
    insights.push({
      id: "comparison-insufficient-data",
      type: "DATA_AVAILABILITY",
      severity: "INFO",
      title: "No previous-period comparison yet",
      description: "A comparison will be available after readings exist in the previous equivalent period.",
      value: null,
      unit: null,
    });
  }

  return insights;
}

export async function getAnalytics(
  userId: number,
  period: AnalyticsPeriod,
  now = new Date(),
) {
  const days = getPeriodDays(period);
  const currentFrom = new Date(now);

  if (period === "today") {
    currentFrom.setHours(0, 0, 0, 0);
  } else {
    currentFrom.setDate(currentFrom.getDate() - days);
  }

  const previousFrom = new Date(currentFrom);
  previousFrom.setDate(previousFrom.getDate() - days);

  const [storedReadings, profile] = await Promise.all([
    analyticsRepository.getReadingsForWindow(userId, previousFrom, now),
    analyticsRepository.getTargetRange(userId),
  ]);

  const readings: NormalizedReading[] = storedReadings.flatMap((reading) => {
    const glucoseMgDl = normalizeGlucoseToMgDl(
      reading.glucoseValue,
      reading.unit,
    );

    return glucoseMgDl === null
      ? []
      : [{ glucoseMgDl, measuredAt: reading.measuredAt }];
  });
  const currentReadings = readings.filter(
    (reading) => reading.measuredAt >= currentFrom,
  );
  const previousReadings = readings.filter(
    (reading) => reading.measuredAt < currentFrom,
  );
  const targetRange = validTargetRange(profile);
  const metrics = summarize(currentReadings, targetRange);
  const previousMetrics = summarize(previousReadings, targetRange);
  const trendResult = determineTrend(currentReadings, currentFrom, now);

  const comparison = previousReadings.length === 0
    ? null
    : {
      previousPeriodLabel: period === "today" ? "Previous day" : `Previous ${days} days`,
        previousReadingCount: previousMetrics.readingCount,
        readingCountChange: metrics.readingCount - previousMetrics.readingCount,
        averageChange:
          metrics.average === null || previousMetrics.average === null
            ? null
            : roundToOneDecimal(metrics.average - previousMetrics.average),
        averageChangePercent:
          metrics.average === null ||
          previousMetrics.average === null ||
          previousMetrics.average === 0
            ? null
            : roundToOneDecimal(
                ((metrics.average - previousMetrics.average) /
                  previousMetrics.average) *
                  100,
              ),
        timeInRangeChange:
          metrics.timeInRange === null || previousMetrics.timeInRange === null
            ? null
            : roundToOneDecimal(metrics.timeInRange - previousMetrics.timeInRange),
      };

  const periodLabel = getPeriodLabel(period);

  return {
    period,
    periodLabel,
    unit: "mg/dL" as const,
    readingCount: metrics.readingCount,
    average: metrics.average === null ? null : roundToOneDecimal(metrics.average),
    minimum: metrics.minimum === null ? null : roundToOneDecimal(metrics.minimum),
    maximum: metrics.maximum === null ? null : roundToOneDecimal(metrics.maximum),
    targetRange,
    belowTarget: metrics.belowTarget,
    inTarget: metrics.inTarget,
    aboveTarget: metrics.aboveTarget,
    timeInRange: metrics.timeInRange === null ? null : roundToOneDecimal(metrics.timeInRange),
    trend: trendResult.trend,
    trendChange: trendResult.change,
    comparison,
    insights: createInsights({
      periodLabel,
      metrics,
      targetRange,
      trend: trendResult.trend,
      trendChange: trendResult.change,
      comparison,
    }),
    disclaimer:
      "These summaries describe recorded measurements and are not a diagnosis or treatment recommendation.",
  };
}