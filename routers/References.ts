import { Router } from "express";
import ReferencesController from "../controllers/References.ts";

const router = Router()

router.get('/specs/all', ReferencesController.getAllSpecs)

router.get('/levels/all', ReferencesController.getAllLevels)

router.get('/lesson_types/all', ReferencesController.getAllLessonTypes)

router.get('/disciplines/all', ReferencesController.getAllDisciplines)

export { router as ReferencesRouter }