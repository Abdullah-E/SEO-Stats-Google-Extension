import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
    
    id:{type:String, required:true},
    email:{type:String},
    verified_email:{type:Boolean},
    name:{type:String, required:true},
    given_name:{type:String, required:true},
    family_name:{type:String},
    picture:{type:String},
    locale:{type:String}
})


export const User = mongoose.model('User', UserSchema)