import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getCompanyById, getUserCompanies, registerCompany, updateCompanyDetails } from "../controllers/company.controller.js";
import { singleUpload } from "../middlewares/multer.middleware.js";


const router = Router()

router.route("/register").post(verifyJwt, registerCompany)
router.route("/get").get(verifyJwt, getUserCompanies)
router.route("/get/:id").get(getCompanyById)
router.route("/update/:id").patch(verifyJwt, singleUpload, updateCompanyDetails)

export default router