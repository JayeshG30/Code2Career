import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"

const app = express()

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    credentials: true
}
app.use(cors(corsOptions))

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())

export {app}