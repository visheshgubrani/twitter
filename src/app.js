import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { UserRouter } from './routes/user.route.js'

const app = express()
app.use(cors())
app.use(express.json({limit: '16kb'}))
app.use(express.urlencoded({extended: true, limit: '16kb'}))
app.use(express.static('public'))
app.use(cookieParser())


// Routers
app.use("/api/v1/users", UserRouter)
export {app}
