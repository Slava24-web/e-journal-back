import { Router } from "express"
import EventsController from "../controllers/Events.ts";

const router = Router()

router.post("/add", EventsController.addEvents)
router.post("/update", EventsController.updateEvents)
router.post("/delete", EventsController.deleteEvent)
router.get("/all-events/:user_id", EventsController.getAllEvents)

export { router as EventsRouter }

