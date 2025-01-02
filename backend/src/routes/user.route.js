import { Router} from "express"
import {
    registerUser,
    loginUser,
    logoutUser,
    updateProfile
} from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(upload, registerUser)
router.route("/login").post(loginUser)
router.route("/logout").get(verifyJwt, logoutUser)
router.route("/update-profile").patch(verifyJwt, upload, updateProfile)

export default router