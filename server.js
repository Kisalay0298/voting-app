const express = require('express')
const { startServer, app} = require('./server/server')
const login = require('./routes/login')
const voters = require('./routes/voters')
const user = require('./routes/user')
const cookieParser = require('cookie-parser')
const path = require('path')
require('dotenv').config();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.set('view engine', 'ejs')
app.set('views', path.resolve('./views'))



app.use('/', login)
app.use('/voter', voters)
app.use('/user', user)

// app.get('/',(req, res)=>{
//     res.send('Hello World!')
// })





startServer()