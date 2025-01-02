import { Router } from "express"
import {verifyJwt} from "../middlewares/auth.middleware.js"
import {
    postJob,
    getAllJobs,
    getJobById,
    getRecruiterJobs
} from "../controllers/job.controller.js"

const router = Router()

router.route("/post").post(verifyJwt, postJob)
router.route("/get").get(getAllJobs)
router.route("/get/:id").get(getJobById)
router.route("/getRecruiterJobs").get(verifyJwt, getRecruiterJobs)

export default router