import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import * as dashboardService from "../services/dashboard.service";

export async function getDashboardSummary(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = req.user!.userId;

    const summary =
      await dashboardService.getDashboardSummary(userId);

    return res.json(summary);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get dashboard summary",
    });
  }
}
export async function getDashboardReadings(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = req.user!.userId;

    const fromParam = req.query.from;
    const toParam = req.query.to;

    let from: Date | undefined;
    let to: Date | undefined;

    if (fromParam !== undefined) {
      if (typeof fromParam !== "string") {
        return res.status(400).json({
          message: "Invalid from date",
        });
      }

      from = new Date(fromParam);

      if (Number.isNaN(from.getTime())) {
        return res.status(400).json({
          message: "Invalid from date",
        });
      }
    }

    if (toParam !== undefined) {
      if (typeof toParam !== "string") {
        return res.status(400).json({
          message: "Invalid to date",
        });
      }

      to = new Date(toParam);

      if (Number.isNaN(to.getTime())) {
        return res.status(400).json({
          message: "Invalid to date",
        });
      }
    }

    if (from && to && from > to) {
      return res.status(400).json({
        message: "from date must be before to date",
      });
    }

    const readings =
      await dashboardService.getDashboardReadings(
        userId,
        from,
        to,
      );

    return res.json(readings);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get dashboard readings",
    });
  }
}
export async function getDashboardPeriod(
  req: AuthRequest,
  res: Response,
) {
  try {
    const userId = req.user!.userId;

    const period = req.query.period;

    if (
      period !== "today" &&
      period !== "7d" &&
      period !== "30d"
    ) {
      return res.status(400).json({
        message:
          "Invalid period. Use today, 7d, or 30d",
      });
    }

    const result =
      await dashboardService.getDashboardPeriod(
        userId,
        period,
      );

    return res.json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to get dashboard period",
    });
  }
}