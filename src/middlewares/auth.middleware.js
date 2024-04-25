import jwt from 'jsonwebtoken'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';

const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "") //get token from the logged in user

        console.log(`The Token ${token}`);
        if(!token) { // if no token is present it means the user is not logged in 
            throw new ApiError(401, "Unauthorized Request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) // verify the user token with own secret which was use to encode the token

        const user = await User.findById(decodedToken?._id).select(-"password -refreshToken") //then find the user based on that token, but how does it have id?

        if (!user) {
            throw new ApiError(401, "Invalid Access Token") //self explainaitory
        }

        req.user = user // whut?
        next() //okay
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})

export {verifyJWT}