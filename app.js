const express = require('express')
const app = express();
const mongoose = require('mongoose')
require('dotenv').config() // dotenv import
const userRoute = require('./routes/user')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const videoRoute = require('./routes/video')
const commentRoute = require('./routes/comment')
const cors = require('cors')


const connectWithDatabase = async()=>{
    try
    {
      const res = await  mongoose.connect(process.env.MONGO_URI)
      console.log('connected with DB..')
    }
    catch(err)
    {
        console.log(err)
    }
}
connectWithDatabase()

app.use(cors());

app.use(bodyParser.json())

app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

app.use(cors());

app.use('/user', userRoute)
app.use('/video',videoRoute)
app.use('/comment',commentRoute)


module.exports= app;