import { Router } from "express"
import AuthController from "../controllers/Auth.ts"
import AuthValidator from "../validators/Auth.ts"

const router = Router()

router.post("/sign-in", AuthValidator.signIn, AuthController.signIn);
router.post("/sign-up", AuthValidator.signUp, AuthController.signUp);
router.post("/logout", AuthValidator.logOut, AuthController.logOut);
router.post("/refresh", AuthValidator.refresh, AuthController.refresh);

export { router as AuthRouter }

