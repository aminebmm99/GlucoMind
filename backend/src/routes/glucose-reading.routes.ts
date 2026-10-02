import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  createGlucoseReading,
  getGlucoseReadings,
  getGlucoseReading,
  updateGlucoseReading,
  deleteGlucoseReading,
} from "../controllers/glucose-reading.controller";

const router = Router();

router.use(authenticate);

router.post("/", createGlucoseReading);
router.get("/", getGlucoseReadings);
router.get("/:id", getGlucoseReading);
router.put("/:id", updateGlucoseReading);
router.delete("/:id", deleteGlucoseReading);

export default router;