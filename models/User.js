const mongoose = require('mongoose')
const { subscribe } = require('../app')

const userSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    channelName:{type:String,require:true},
    email:{type:String,require:true},
    phone:{type:String,require:true},
    password:{type:String,require:true},
    logoUrl:{type:String,require:true},
    logoId:{type:String,require:true},
    subscribers:{type:Number,default:0},
    subscribedBy:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    subscribedChannels:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}]
},{timestamps:true})

const User =mongoose.model('User', userSchema);
module.exports = {User}