import { Router} from "express"
import {
    registerUser,
    loginUser,
    logoutUser,
    updateProfile
} from "../controllers/user.controller.js"
import { singleUpload } from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(singleUpload, registerUser)
router.route("/login").post(loginUser)
router.route("/logout").get(verifyJwt, logoutUser)
router.route("/update-profile").patch(verifyJwt, singleUpload, updateProfile)

export default router