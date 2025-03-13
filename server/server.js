const express = require('express')
const connectToDB = require('../config/configDB');
const app = express()


async function startServer(){
    await connectToDB();
    const port = process.env.LOCALPORT;
    app.listen(port, ()=>{
        console.log(`Server is running on http://localhost:${port}`)
    })
}


module.exports = { startServer, app };