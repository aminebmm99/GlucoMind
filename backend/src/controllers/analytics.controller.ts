import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as analyticsService from "../services/analytics.service";

const ANALYTICS_PERIODS = ["today", "7d", "14d", "30d"] as const;

export async function getDashboardAnalytics(
  req: AuthRequest,
  res: Response,
) {
  const period = req.query.period ?? "7d";

  if (
    typeof period !== "string" ||
    !ANALYTICS_PERIODS.includes(period as (typeof ANALYTICS_PERIODS)[number])
  ) {
    return res.status(400).json({
      message: "Invalid period. Use today, 7d, 14d, or 30d",
    });
  }

  try {
    const analytics = await analyticsService.getAnalytics(
      req.user!.userId,
      period as analyticsService.AnalyticsPeriod,
    );

    return res.json(analytics);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get dashboard analytics",
    });
  }
}