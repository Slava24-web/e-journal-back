import { Router } from "express";
import ReferencesController from "../controllers/References";

const router = Router()

router.get('/specs/all', ReferencesController.getAllSpecs)

router.get('/levels/all', ReferencesController.getAllLevels)

router.get('/lesson_types/all', ReferencesController.getAllLessonTypes)

export { router as ReferencesRouter }