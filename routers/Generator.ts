import { Router } from "express"
import GeneratorController from "../controllers/Generator.ts";

const router = Router()

router.post('/control', GeneratorController.generateControlWorks)

router.post('/home', GeneratorController.generateHomeWorks)

export { router as GeneratorRouter }