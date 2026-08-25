import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
   name:{type:String,required:true},
   email:{type:String,required:true,unique:true},
  password: { type: String, required: true },
   isAdmin:{type:Boolean,default:false},
   emailVerified:{type:Boolean,default:false},
   emailVerificationToken:String,
   passwordResetToken:String,
   passwordResetExpires:Date
},{timestamps:true});

const User=mongoose.model("User",userSchema);
export default User;
