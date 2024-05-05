import { Redis } from "ioredis";
import { asyncHandler } from "../utils/asyncHandler.js";
// Connect to redis
const redis = new Redis()

const cacheMiddleware = asyncHandler(async(req, res, next) => {
    const key = req.originalUrl

    try {
        const cachedData = await redis.get(key)

        if (!cachedData) {
            next()
        }

        res.json(JSON.parese(cachedData))
        return
    } catch (error) {
        console.log('Redis Error', error);
        next()
    }
})

export {cacheMiddleware}

