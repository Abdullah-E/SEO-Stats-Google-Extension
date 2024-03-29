import mongoose from "mongoose"

const CodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})
export const Code = mongoose.model('Code', CodeSchema)