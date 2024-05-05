import { Router } from "express";
import JournalController from "../controllers/Journal";

const router = Router()

router.post('/group/upload', JournalController.uploadGroupWordFile)

router.get('/group/all', JournalController.getAllGroups)

router.get('/students', JournalController.getStudentsByGroupId)

router.post('/marks/add', JournalController.addMark)

router.get('/marks', JournalController.getMarksByEventId)

export { router as JournalRouter }