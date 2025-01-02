import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"

const generateAccessAndRefreshToken = async(userId) => {
    const user = await User.findById(userId)
    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()
    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})

    return {accessToken, refreshToken}
}

const registerUser = asyncHandler(async (req, res) => {
    // try {
        console.log(req.body);
        
        const {fullName, email, username, password, phoneNumber, role} = req.body

        console.log(req.body)
    
        if([fullName, email, username, password, phoneNumber, role].some((field) => field?.trim() === "")) {
            throw new ApiError(400, "All fields are required")
        }
    
        const existedUser = await User.findOne({
            $or: [{username}, {email}]
        })
    
        if(existedUser){
            throw new ApiError(400, "User with this email or username already exists!")
        }
    
        const user = await User.create({
            fullName,
            email,
            username: username.toLowerCase(),
            password,
            phoneNumber,
            role
        })

        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

        if(!createdUser){
            throw new ApiError(500, "Something went wrong while registering the user!")
        }else {
            return res
            .status(200)
            .json(new ApiResponse(
                200,
                createdUser,
                "User registered successfully"
            ))
        }
    // } catch (error) {
    //     throw new ApiError(500, "Something went wrong while registering the user", error)
    // }
})

const loginUser = asyncHandler(async (req, res) => {
    // try {
        const {username, email, password, role} = req.body

        if((!username && !email)){
            throw new ApiError(400, "Username or email is required")
        }

        const usernameLower = username.toLowerCase()

        if((!password || !role) || role.trim() === "") {
            throw new ApiError(400, "Password and role are required")
        }
        
        console.log(usernameLower)
        const user = await User.findOne({
            $or: [{username: usernameLower}, {email}]
        })

        if(!user){
            throw new ApiError(404, "User does not exist!")
        }

        const isPasswordValid = await user.isPasswordCorrect(password)

        if(!isPasswordValid){
            throw new ApiError(400, "Invalid user credentials!")
        }

        if(role !== user.role){
            throw new ApiError(404, "User with current role does not exist!")
        }

        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        }

        return res
        .status(200)
        .cookie("accessToken", accessToken,{maxAge: 15*60*1000, ...options})
        .cookie("refreshToken", refreshToken, {maxAge: 7*24*60*60*1000, ...options})
        .json(
            new ApiResponse(
                200, 
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully!"
            )
        )
    // } catch (error) {
    //     throw new ApiError(500, "Something went wrong while logging in")
    // }
})

const logoutUser = asyncHandler(async(req, res) => {
    // try {
        await User.findByIdAndUpdate(
            req.user?._id,
            {
                $unset: {
                    refreshToken: 1
                }
            },
            {
                new: true
            }
        )

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        }

        return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(
            200, 
            {},
            "User logged out successfully!"
        ))
    // } catch (error) {
    //     throw new ApiError(500, "Something went wrong while logging out the user!", error)
    // }
})

const updateProfile = asyncHandler(async(req, res) => {
    // login validation and uploads are remaining
    try {
        const {fullName, email, username, phoneNumber, role, bio, skills} = req.body
    
        if((!fullName || !email || !username || !phoneNumber || !role) || [fullName, email, username, phoneNumber, role].some((field) => field.trim() === "")){
            throw new ApiError(400, "All Complusory fields are required")
        }
    
        const skillsArray = skills ? skills.split(",") : []
    
        const user = await User.findByIdAndUpdate(
            req.user?._id, //middleware remaining
            {
                $set: {
                    fullName, 
                    email,
                    username,
                    phoneNumber,
                    role,
                    "profile.bio": bio
                },
                $push: {
                    "profile.skills" : {
                        $each: skillsArray || []
                    }
                }
            },
            {
                new: true,
                runValidators: true
            }
        ).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(404, "User not found")
        }

        return res
        .status(200)
        .json(new ApiResponse(
            200,
            user,
           "User profile updated successfully!" 
        ))
    } catch (error) {
        console.error(error)
        throw new ApiError(500, "Something went wrong while updating the user profile", error)
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    updateProfile
}