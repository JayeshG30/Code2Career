import { Job } from "../models/job.models.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { isValidObjectId } from "mongoose";

const postJob = asyncHandler(async(req, res) => {
    try {
        const {title, description, requirements, salary, experience, location, jobType, no_of_openings, companyId} = req.body
    
        if(!title || !description || !requirements || !salary || !experience || !location || !jobType || !no_of_openings || !companyId || [title, description, requirements, salary, experience, location, jobType, no_of_openings, companyId].some((field) => field.trim() === "")){
            throw new ApiError(401, "All fields are required!")
        }
    
        if(!req.user){
            throw new ApiError(401, "Login to post a job!")
        }
    
        if(req.user?.role !== "recruiter") {
            throw new ApiError(401, "Only recruiters can post a job!")
        }
    
        const requirementsArray = requirements ? requirements.split(",") : []
        const job = await Job.create({
            title,
            description,
            requirements: requirementsArray,
            salary,
            experience: Number(experience),
            location,
            jobType,
            no_of_openings: Number(no_of_openings),
            company: companyId,
            created_by: req.user?._id
        })
    
        if(!job){
            throw new ApiError(500, "Something went wrong while posting the job!")
        }
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            job,
            "Job posted successfully!"
        ))
    } catch (error) {
        console.error(error)
    }
}) 

const getAllJobs = asyncHandler(async(req, res) => {
    try {
        const keyword = req.query.keyword || ""

        const query = {
            $or:[
                {title:{$regex:keyword, $options:"i"}},
                {description:{$regex:keyword, $options:"i"}}
            ]
        }

        const jobs = await Job.find(query).populate({
            path: "company",
            options: {sort: {createdAt: 1}}
        })

        if(!jobs.length){
            return res
            .status(404)
            .json(new ApiResponse(
                404,
                "Job not found!"
            ))
        }

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            jobs,
            "Jobs fetched successfully!"
        ))
    } catch (error) {
        console.error(error)
    }
})

const getJobById = asyncHandler(async(req, res) => {
    try {
        const {id: jobId} = req.params

        if(!jobId || !isValidObjectId(jobId)){
            throw new ApiError(401, "Invalid jobId!")
        }

        const job = await Job.findById(jobId).populate({
            path: "company",
            options: {sort: {createdAt: 1}}
        })

        if(!job){
            throw new ApiError(401, "No such job exists!")
        }

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            job,
            "Job fetched successfully!"
        ))
    } catch (error) {
        console.error(error)
    }
})

const getRecruiterJobs = asyncHandler(async(req, res) => {
    const {_id: id} = req.user?._id
    if(!id || !isValidObjectId(id)){
        throw new ApiError(401, "Invalid ID!")
    }

    const jobs = await Job.find({created_by: id})

    if(!jobs){
        throw new ApiError(404, "No job found posted by this recruiter!")
    }

    return res
    .status(200)
    .json(new ApiResponse(
        200,
        jobs,
        "Job for this recruiter fetched successfully!"
    ))
})

export {
    postJob,
    getAllJobs,
    getJobById,
    getRecruiterJobs
}