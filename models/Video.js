const mongoose = require('mongoose')


const videoSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    title:{type:String,require:true},
    description:{type:String,require:true},
    user_id:{type:String,require:true},
    video_url:{type:String,require:true},
    video_id:{type:String,require:true},
    thumbnail_url:{type:String,require:true},
    thumbnail_id:{type:String,require:true},
    category:{type:String,require:true},
    tags:[{type:String}],
    likes:{type:Number,require:true,default:0},
    dislike:{type:Number,require:true,default:0},
    likedBy:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    dislikedBy:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    view:{type:Number,require:true,default:0},
    viewedBy:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}]
},{timestamps:true})

const Video =mongoose.model('Video', videoSchema);
module.exports = {Video}