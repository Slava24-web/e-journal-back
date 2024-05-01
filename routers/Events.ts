import { Router } from "express"
import EventsController from "../controllers/Events";

const router = Router()

router.post("/add", EventsController.addEvents)

router.post("/update", EventsController.updateEvents)

router.get("/all-events/:user_id", EventsController.getAllEvents)

export { router as EventsRouter }