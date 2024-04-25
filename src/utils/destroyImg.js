import { v2 as cloudinary } from "cloudinary"

const destroyImg = async (publicId) => {
    try {
        await cloudinary.uploader.destroy(publicId)
    } catch (error) {
        console.log(`Error in deleting the image ${error}`);
    }
}

export {destroyImg}