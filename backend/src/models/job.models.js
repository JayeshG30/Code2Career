import mongoose, {Schema} from "mongoose";

const jobSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        requirements: [{
            type: String,
            required: true,
        }],
        salary: {
            type: Number,
            required: true
        },
        experience: {
            type: Number,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        jobType: {
            type: String,
            required: true
        },
        no_of_openings:{
            type: Number,
            required: true
        },
        company: {
            type: Schema.Types.ObjectId,
            ref: "Company",
            required: true
        },
        created_by: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        applications: [
            {
                type: Schema.Types.ObjectId,
                ref: "Application"
            }
        ]
    }, {timestamps: true}
)

export const Job = mongoose.model("Job", jobSchema)