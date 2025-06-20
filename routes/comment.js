const express = require('express')
const checkAuth = require('../middleware/checkAuth')
const {Comment} = require('../models/Comment')
const jwt = require('jsonwebtoken')
const { default: mongoose } = require('mongoose')
const Router = express.Router()

// new comment

Router.post('/new-comment/:videoId',checkAuth,async(req,res)=>{
    try
    {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1],'sbs online classes 123')
        console.log(verifiedUser)
        const newComment = new Comment({
            _id: new mongoose.Types.ObjectId,
            video_id: req.params.videoId,
            user_id: verifiedUser._id,
            commentText: req.body.commentText,
        })
        const comment = await newComment.save()
        res.status(200).json({
            msg: 'comment done'
        })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
})

// get all comments

Router.get('/:videoId',async(req,res)=>{
    try
    {
        const comments = await Comment.find({video_id:req.params.videoId}).populate('user_id','channelName logoUrl')
        res.status(200).json({
            commentList:comments
        })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})

// update comments

Router.put('/:commentId',checkAuth,async(req,res)=>{
    try
    {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1],'sbs online classes 123')
        console.log(verifiedUser)
        const comment = await Comment.findById(req.params.commentId)
        console.log(comment)
        if(comment.user_id != verifiedUser._id){
            return res.status(500).json({
                error: 'invalid user'
            })
        }
        comment.commentText=req.body.commentText
        const updatedComment = await comment.save()
        res.status(200).json({
            updatedComment:updatedComment
        })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})

// delete own comment

Router.delete('/delete/:commentId',checkAuth,async(req,res)=>{
    try
    {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1],'sbs online classes 123')
        console.log(verifiedUser)
        const comment = await Comment.findById(req.params.commentId)
        console.log(comment)
        if( comment.user_id != verifiedUser._id){
            return res.status(500).json({
                error: 'invalid user'
            })
        }
        await Comment.findByIdAndDelete(req.params.commentId)
        res.status(200).json({
            msg:'successfully deleted your comment'
        })
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error:err
        })
    }
})


module.exports=Router