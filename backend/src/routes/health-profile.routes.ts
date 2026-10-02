import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  getHealthProfile,
  createHealthProfile,
  updateHealthProfile,
  deleteHealthProfile,
} from "../controllers/health-profile.controller";

const router = Router();

router.use(authenticate);

router.get("/", getHealthProfile);
router.post("/", createHealthProfile);
router.put("/", updateHealthProfile);
router.delete("/", deleteHealthProfile);

export default router;