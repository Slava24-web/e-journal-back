import { Router } from "express";
import JournalController from "../controllers/Journal";

const router = Router()

router.post('/group/upload', JournalController.uploadGroupWordFile)

export { router as JournalRouter }