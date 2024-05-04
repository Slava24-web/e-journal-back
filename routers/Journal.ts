import { Router } from "express";
import JournalController from "../controllers/Journal";

const router = Router()

router.post('/group/upload', JournalController.uploadGroupWordFile)

router.get('/group/all', JournalController.getAllGroups)

router.get('/students', JournalController.getStudentsByGroupId)

export { router as JournalRouter }