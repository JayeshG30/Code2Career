import { Application } from "../models/application.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { isValidObjectId } from "mongoose"
import { Job } from "../models/job.models.js"

const applyJob = asyncHandler(async(req, res) => {
    const {_id: userId} = req.user._id
    const {id: jobId} = req.params

    if(!userId) {
        throw new ApiError(401, "Login to apply for the job!")
    }

    if(!jobId || !isValidObjectId(jobId)){
        throw new ApiError(401, "Invalid jobId!")
    }

    const existingApplication = await Application.findOne({job: jobId, applicant: userId})

    if(existingApplication) {
        throw new ApiError(401, "You have already applied for this job!")
    }

    const job = await Job.findById(jobId)

    if(!job){
        throw new ApiError(404, "No such job exists!")
    }

    const newApplication = await Application.create({
        job: jobId,
        applicant: userId,
    })

    if(!newApplication){
        throw new ApiError(500, "Something went wrong while applying for the job!")
    }

    job.applications.push(newApplication._id)
    await job.save()

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        newApplication,
        "Application created successfully!"
    ))
})

const getAppliedJobs = asyncHandler(async(req, res) => {
    try {
        const user = req.user
    
        if(!user){
            throw new ApiError(401, "Please login to fetch the applications!")
        }
    
        const applications = await Application.find({applicant: user._id}).sort({createdAt: -1}).populate({
            path: "job",
            options: {sort: {createdAt: 1}},
            populate: {
                path: "company",
                options: {sort: {createdAt: 1}}
            }
        })
    
        if(!applications.length){
            throw new ApiError(404, "No applications found for this user!")
        }
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            applications,
            "Applications of the user fetched successfully!"
        ))
    } catch (error) {
        console.error(error)
    }
})

const getApplicants = asyncHandler(async(req, res) => {
    try {
        const {id: jobId} = req.params
    
        if(!jobId || !isValidObjectId(jobId)){
            throw new ApiError(401, "Invalid jobId!")
        }

        const job = await Job.findById(jobId)

        if(!job){
            throw new ApiError(404, "No such job exists!")
        }
    
        const applicants = await Application.find({job: jobId}).populate({
            path: "applicant",
            options: {sort: {createdAt: 1}}
        })
    
        if(!applicants.length){
            throw new ApiError(404, "No applications for this job!")
        }
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            applicants,
            "Applicants fetched successfully!"
        ))
    } catch (error) {
        console.error(error)
    }
})

const updateStatus = asyncHandler(async(req, res) => {
    try {
        const {status} = req.body
        const {id: applicationId} = req.params

        const user = req.user

        if(!user) {
            throw new ApiError(401, "Login to update the status!")
        }

        if(user.role !== "recruiter"){
            throw new ApiError(401, "Only recruiters can update the status!")
        }

        if(!status || status.trim() === ""){
            throw new ApiError(401, "Status is required!")
        }

        if(!applicationId || !isValidObjectId(applicationId)){
            throw new ApiError(401, "Invalid applicationId!")
        }

        const updatedApplication = await Application.findByIdAndUpdate(
            applicationId,
            {
                $set: {
                    status: status
                }
            },
            {
                new: true,
                runValidators: true
            }
        )

        if(!updatedApplication) {
            throw new ApiError(401, "Application does not exist!")
        }

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedApplication,
            "Status updated sucessfully!"
        ))
    } catch (error) {
        console.error(error)
    }
})

export {
    applyJob,
    getAppliedJobs,
    getApplicants,
    updateStatus
}