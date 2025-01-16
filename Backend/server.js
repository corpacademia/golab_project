const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const path = require('path')
const bodyParser = require('body-parser')

const app = express();
const Port = 3000;

const authRouter = require('./src/Routes/authRoutes')
const cloudRouter = require('./src/Routes/cloudRoute')

dotenv.config({path:"./.env"})
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
app.use(express.json())
// app.use("*",(req,res)=>{
//     res.json("Hello from Backend")
// })
app.use('/api/v1',authRouter);
app.use('/api/v1',cloudRouter);



app.listen(Port,()=>{
    console.log(`Server Started at Port: ${Port}`);
})


