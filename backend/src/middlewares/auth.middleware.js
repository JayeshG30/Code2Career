import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.models.js"


export const verifyJwt = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
    
        if(!token){
            throw new ApiError(401, "Token is missing")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
    
        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
    
        req.user = user
        next()
    } catch (error) {
        console.error(error)
        if (error instanceof jwt.JsonWebTokenError) {
            // Handle invalid token
            next(new ApiError(401, "Invalid token"));
        } else if (error instanceof jwt.TokenExpiredError) {
            // Handle expired token
            next(new ApiError(401, "Token expired"));
        } else {
            // Other errors
            next(new ApiError(500, "Authentication failed"));
        }
    }
})

