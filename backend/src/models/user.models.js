import mongoose, {Schema} from "mongoose";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true,

        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        username: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: Number,
            required: true,
            unique: true
        },
        role: {
            type: String,
            enum: ['student', 'recruiter'],
            required: true
        },
        profile: {
            bio: {
                type: String
            },
            skills: [{
                type: String
            }],
            resume: {
                type: String
            },
            resumeOriginalName: {
                type: String
            },
            company: {
                type: Schema.Types.ObjectId,
                ref: "Company"
            },
            profilePhoto: {
                type: String,
                default: ""
            }
        },
        refreshToken: {
            type: String
        }
    }, {timestamps: true}
)

userSchema.pre('save', async function(next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function(){
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign(
        {
            _id: this.id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)