const mongoose = require('mongoose')

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Database Connected")
    }catch(err){
        console.log("Database connection failed:", err.message)
        console.log("Server will continue without database — some features will be unavailable.")
    }
}

module.exports = connectDB