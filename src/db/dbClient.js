import mongoose from "mongoose";

const dbClient = async () => {
    try {
        await mongoose.connect(`${MONGODB_URI}/twitter`)
    } catch (error) {
        console.log(error);
        process.exit(1)
    }
}

export {dbClient}