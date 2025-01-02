import { Router } from  "express"
import {verifyJwt} from "../middlewares/auth.middleware.js"
import {
    applyJob,
    getAppliedJobs,
    getApplicants,
    updateStatus
} from "../controllers/applicaton.controller.js"

const router = Router()

router.route("/apply/:id").post(verifyJwt, applyJob)
router.route("/get").get(verifyJwt, getAppliedJobs)
router.route("/applicants/:id").get(getApplicants)
router.route("/update-status/:id").patch(verifyJwt, updateStatus)

export default router