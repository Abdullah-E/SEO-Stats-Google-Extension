import mongoose from 'mongoose'
const mongoConnectionURL = process.env.MONGO_URL?? "mongodb+srv://dev1:kalimat123@kalimat.zg0uxv1.mongodb.net/?retryWrites=true&w=majority"

export const mongo = await mongoose.connect(mongoConnectionURL)
console.log("mongo connected")
