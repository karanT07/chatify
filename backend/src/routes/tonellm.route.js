// backend/src/routes/toneLLMRoutes.js
import express from "express";
const router = express.Router();
import { analyzeToneLLM } from "../controllers/tone.controller.llm.js"

router.post('/', analyzeToneLLM);

export default router;