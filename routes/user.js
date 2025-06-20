const express = require('express')
const Router = express.Router();
const bcrypt=require('bcrypt')
const cloudinary = require('cloudinary').v2
require('dotenv').config()
const {User} = require('../models/User.js')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const checkAuth = require('../middleware/checkAuth.js');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

//SIGNUP SETUP

Router.post('/signup', async (req,res)=>{
    try
    {
      const users = await User.find({email:req.body.email})
      if(users.length>0){
        return res.status(500).json({
          error: 'email is already register'
        })
      }
      
      const hashCode = await bcrypt.hash(req.body.password, 10)
      const uploadedImage = await cloudinary.uploader.upload(req.files.logo.tempFilePath)
      
      const newUser = new User({
        _id: new mongoose.Types.ObjectId,
        channelName: req.body.channelName,
        email: req.body.email,
        phone: req.body.phone,
        password: hashCode,
        logoUrl: uploadedImage.secure_url,
        logoId: uploadedImage.public_id
      })

      const user = await newUser.save()
      res.status(200).json({
        newUser: user
      })

    }
    catch(err)
    {
        console.log(err)
        res.status(400).json({
            err
            
        })
    }
    
    
})

//LOGIN SETUP

Router.post('/login', async (req,res)=>{
  
  try
  {
     //console.log(req.body)
     const users = await User.find({email:req.body.email})
    //console.log(users)

     if(users.length==0){
      return res.status(500).json({
        error: "email is not register"
      })
     }

     const pw = String(req.body.password)
     const isValid = await bcrypt.compare(pw,users[0].password)
     console.log(isValid)

     if(!isValid){
      return res.status(500).json({
        error:'invalid password'
      })
     }
     const token = jwt.sign({
        _id:users[0]._id,
        channelName:users[0].channelName,
        email:users[0].email,
        phone:users[0].phone,
        logoId:users[0].logoId,
         
      },
      'sbs online classes 123',
      {
        expiresIn:'365d'
      }

    )

    res.status(200).json({
        _id:users[0]._id,
        channelName:users[0].channelName,
        email:users[0].email,
        phone:users[0].phone,
        logoId:users[0].logoId,
        logoUrl:users[0].logoUrl,
        token:token,
        subscribers:users[0].subscribedChannels
    })

  }
  catch(err)
  {
    console.log(err)
    res.status(500).json({
      error:"something is wrong"
    })
  }
})

//SUBSCRIBE SETUP

Router.put('/subscribe/:userBId' , checkAuth , async (req,res)=>{
  try
  {
      const userA = await jwt.verify(req.headers.authorization.split(" ")[1],'sbs online classes 123')
      const userB = await User.findById(req.params.userBId)
      if(userB.subscribedBy.includes(userA._id)){
      return res.status(500).json({
        error: 'Already subscribed'
      })
    }
      userB.subscribers += 1;
      userB.subscribedBy.push(userA._id)
      await userB.save()
      const userAFullInformation = await User.findById(userA._id)
      userAFullInformation.subscribedChannels.push(userB._id)
      await userAFullInformation.save()
      res.status(200).json({
        msg: 'subscribed...'
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

// UNSUBSCRIBE SETUP

Router.put('/unsubscribe/:userBId' , checkAuth , async (req,res)=>{
  try
  {
    const userA = await jwt.verify(req.headers.authorization.split(" ")[1],'sbs online classes 123')
    const userB = await User.findById(req.params.userBId)
    if(!userB.subscribedBy.includes(userA._id)){
      res.status(500).json({
        error: 'not subscribed'
      })
    }
    userB.subscribers -= 1;
     userB.subscribedBy = await userB.subscribedBy.filter(userId=>userId.toString() != userA._id.toString())
    
    await userB.save()
    const userAFullInformation = await User.findById(userB._id)
    // userAFullInformation.subscribedChannels = await userAFullInformation.subscribedChannels.filter(userId=>userId.toString() != userB._id)
    // userA.subscribedChannels = userA.subscribedChannels.filter(id => id.toString() !== userB._id.toString());
    userAFullInformation.subscribedChannels =  userAFullInformation.subscribedChannels.filter(id => id.toString() != userB._id.toString());

    await userAFullInformation.save()
    res.status(200).json({
      msg: 'unsubscribed..'
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