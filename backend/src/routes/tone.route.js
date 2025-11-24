// backend/src/routes/toneRoutes.js
import express from "express";
const router = express.Router();
import { analyzeTone } from "../controllers/tone.controller.js"

router.post('/', analyzeTone);

export default router;