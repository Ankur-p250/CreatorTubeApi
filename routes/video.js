const express = require('express')
const Router = express.Router()
const checkAuth = require('../middleware/checkAuth')
const jwt = require('jsonwebtoken')
const cloudinary = require('cloudinary').v2
const {Video} = require('../models/Video')
const mongoose = require('mongoose')

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

// get own video

Router.get('/my-videos',checkAuth,async(req,res)=>{
    try
    {
        const user = await jwt.verify(req.headers.authorization.split(" ")[1],'sbs online classes 123')
        //console.log(user)
        const videos = await Video.find({user_id:user._id}).populate('user_id','channelName logoUrl subscribers')
        console.log(videos)
        res.status(200).json({
            videos: videos
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

// upload video

Router.post('/upload', checkAuth , async (req,res)=>{
    
    try
    {
        const token = req.headers.authorization.split(' ')[1] 
        const user = await jwt.verify(token,'sbs online classes 123')
        // console.log(user)
        // console.log(req.body)
        // console.log(req.files.video)
        // console.log(req.files.thumbnail)
        const uploadedVideo = await cloudinary.uploader.upload(req.files.video.tempFilePath,{
            resource_type: 'video'
        })
        const uploadedThumbnail = await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath)
        // console.log(uploadedThumbnail)
        // console.log(uploadedVideo)
        const newVideo = new Video({
                _id: new mongoose.Types.ObjectId(),
                title: req.body.title,
                description: req.body.description,
                user_id: user._id,
                video_url: uploadedVideo.secure_url,
                video_id: uploadedVideo.public_id,
                thumbnail_url: uploadedThumbnail.secure_url,
                thumbnail_id: uploadedThumbnail.public_id,
                category: req.body.category,
                tags: req.body.tags.split(","),
        })
        
        const newUploadedVideoData = await newVideo.save()
        res.status(200).json({
            newVideo: newUploadedVideoData
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

// update video details

Router.put('/:videoId', checkAuth , async (req,res)=>{

try
{
    const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1],'sbs online classes 123')
    const mongoose = require('mongoose')

// Inside your PUT route
// if (!mongoose.Types.ObjectId.isValid(req.params.videoId)) {
//   return res.status(400).json({ error: "Invalid video ID" })
// }

    const video = await Video.findById(req.params.videoId)
    
    if(video.user_id==verifiedUser._id){
        //update video details
        if(req.files){
            await cloudinary.uploader.destroy(video.thumbnail_id)
            const updatedThumbnail =await cloudinary.uploader.upload(req.files.thumbnail.tempFilePath)
            const updateData = {
                title: req.body.title,
                description: req.body.description,
                category: req.body.category,
                tags: req.body.tags.split(","),
                thumbnail_url: updatedThumbnail.secure_url,
                thumbnail_id: updatedThumbnail.public_id,
            }
            const updatedVideoDetails = await Video.findByIdAndUpdate(req.params.videoId , updateData , {new:true})
            res.status(200).json({
                updatedVideo: updatedVideoDetails
            })
        }
        else{
            const updateData = {
                title: req.body.title,
                description: req.body.description,
                category: req.body.category,
                tags: req.body.tags.split(",")
            }
            const updatedVideoDetails = await Video.findByIdAndUpdate(req.params.videoId , updateData , {new:true})
            res.status(200).json({
                updatedVideo: updatedVideoDetails
            })
        }
    }
    else{
        return res.status(500).json({
            error: 'you have no permission'
        })
    }

}
catch(err)
{
    console.log(err)
    res.status(500).json({
        error: err
    })
}

})

// delete video

Router.delete('/:videoId', checkAuth , async (req,res)=>{
    try
    {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1],'sbs online classes 123')
        const video = await Video.findById(req.params.videoId)
        if(video.user_id==verifiedUser._id){
            //delete video, thumnail and data from database
            await cloudinary.uploader.destroy(video.video_id , {resource_type:'video'})
            await cloudinary.uploader.destroy(video.thumbnail_id)
            const deletedResponse = await Video.findByIdAndDelete(req.params.videoId)
            res.status(200).json({
                deletedResponse: deletedResponse
            })
        }
        else{
            return res.status(500).json({
                error: 'you have no permission to delete'
            })
        }
    }
    catch(err)
    {
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
})

// like  

Router.put('/like/:videoId',checkAuth,async(req,res)=>{
    try
    {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1],'sbs online classes 123')
        console.log(verifiedUser)
        const video = await Video.findById(req.params.videoId)
        if(video.likedBy.includes(verifiedUser._id)){
            return res.status(500).json({
                error: 'Already liked'
            })
        }

        if(video.dislikedBy.includes(verifiedUser._id)){
            video.dislike -= 1
            video.dislikedBy = video.dislikedBy.filter(userId=>userId.toString() != verifiedUser._id)
            // video.dislikedBy.pop(verifiedUser._id)
        }

        video.likes += 1;
        video.likedBy.push(verifiedUser._id)
        await video.save();
        res.status(200).json({
            msg: 'liked'
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

// dislike 

Router.put('/dislike/:videoId',checkAuth,async(req,res)=>{
    try
    {
        const verifiedUser = await jwt.verify(req.headers.authorization.split(" ")[1],'sbs online classes 123')
        console.log(verifiedUser)
        const video = await Video.findById(req.params.videoId)
        if(video.dislikedBy.includes(verifiedUser._id)){
            return res.status(500).json({
                error: 'Already disliked'
            })
        }
        if(video.likedBy.includes(verifiedUser._id)){
            video.likes -= 1
            video.likedBy = video.likedBy.filter(userId=>userId.toString() != verifiedUser._id)
            // video.likedBy.pop(verifiedUser._id)
        }
        video.dislike += 1;
        video.dislikedBy.push(verifiedUser._id)
        await video.save();
        res.status(200).json({
            msg: 'disliked'
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

// views

Router.put('/views/:videoId',async(req,res)=>{
    try
    {
        const video = await Video.findById(req.params.videoId)
        console.log(video)
        video.view+=1
        await video.save()
        res.status(200).json({
            msg: 'ok'
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



module.exports = Router