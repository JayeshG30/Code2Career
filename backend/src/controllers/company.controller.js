import { isValidObjectId } from "mongoose";
import { Company } from "../models/company.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import getDataUri from "../utils/dataUri.js";
import cloudinary from "../utils/Cloudinary.js"


const registerCompany = asyncHandler(async(req, res) => {
    try {
        const {companyName} = req.body
    
        if(!companyName || companyName.trim() === ""){
            throw new ApiError(401, "Company name is required")
        }
    
        if(!req.user){
            throw new ApiError("Please login to register a company!")
        }
    
        if(req.user.role !== "recruiter"){
            throw new ApiError(401, "Only recruiters can register a company!")
        }
    
        const name = companyName.toLowerCase().trim()
    
        const existingCompany = await Company.findOne({
            name
        })
    
        if(existingCompany) {
            throw new ApiError(401, "Company is already registered")
        }
    
        const company = await Company.create({
            name,
            userId: req.user?._id
        })
    
        if(!company){
            throw new ApiError(500, "Something went wrong while registering the company!")
        }
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            company,
            "Company registered successfully!"
        ))
    } catch (error) {
        console.error(error)
    }
})

const getUserCompanies = asyncHandler(async(req, res) => {
    try {
        const user = req.user

        if(!user) {
            throw new ApiError(401, "Please login!")
        }

        const companies = await Company.find({userId: user._id})
        if(!companies.length){
            throw new ApiError(404, "No companies found for this user")
        }

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            companies,
            "Companies fetched successfully"
        ))
    } catch (error) {
        console.error(error)
    }
})

const getCompanyById = asyncHandler(async(req, res) => {
    try {
        const {id: companyId} = req.params
    
        if(!companyId || !isValidObjectId(companyId)) {
            throw new ApiError(401, "Invalid companyId!")
        }
    
        const company = await Company.findById(companyId)
    
        if(!company){
            throw new ApiError(404, "Company not found!")
        }
    
        return res
        .status(200)
        .json(new ApiResponse(
            200,
            company,
            "Company fetched successfully!"
        ))
    } catch (error) {
        console.error(error)
    }
})

const updateCompanyDetails = asyncHandler(async(req, res) => {
    try {
        const {name, description, website, location} = req.body
        const {id: companyId} = req.params

        if(!companyId || !isValidObjectId(companyId)) {
            throw new ApiError(401, "Invalid companyId")
        }

        if(!name || !description || !website || !location || [name, description, website, location].some((field) => field.trim() === "")){
            throw new ApiError(401, "All fields are required")
        }

        const file = req.file

        const fileUri = getDataUri(file)
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content)
        const logo = cloudResponse.secure_url

        if(!req.user) {
            throw new ApiError(401, "You are not authorized to update the profile")
        }

        if(req.user.role !== "recruiter") {
            throw new ApiError(401, "Only recruiters can update the profile")
        }

        const company = await Company.findById(companyId)

        if(!company){
            throw new ApiError(401, "No such company exists")
        }

        const companyName = name.toLowerCase().trim()

        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            {
                $set: {
                    companyName,
                    description,
                    website,
                    location,
                    logo
                }
            },
            {
                new: true,
                runValidators: true
            }
        )

        if(!updatedCompany) {
            throw new ApiError(500, "Something went wrong while updating the company details!")
        }

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            updatedCompany,
            "Company details updated successfully!"
        ))
    } catch (error) {
        console.error(error)
    }
})

export {
    registerCompany,
    getUserCompanies,
    getCompanyById,
    updateCompanyDetails
}