import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  getDashboardSummary,
  getDashboardReadings,
  getDashboardPeriod,
} from "../controllers/dashboard.controller";
import { getDashboardAnalytics } from "../controllers/analytics.controller";

const router = Router();

router.use(authenticate);

router.get("/summary", getDashboardSummary);
router.get("/readings", getDashboardReadings);
router.get("/period", getDashboardPeriod);
router.get("/analytics", getDashboardAnalytics);

export default router;