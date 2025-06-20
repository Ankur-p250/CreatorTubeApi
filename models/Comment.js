const mongoose = require('mongoose')


const commentSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    user_id:{type:mongoose.Schema.Types.ObjectId,require:true,ref:'User'},
    video_id:{type:String,require:true},
    commentText:{type:String,require:true}
},{timestamps:true})

const Comment =mongoose.model('Comment', commentSchema);
module.exports = {Comment}