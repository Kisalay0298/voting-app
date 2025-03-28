const express = require('express')
const connectToDB = require('../config/configDB');
const app = express()


async function startServer(){
    await connectToDB();
    const port = process.env.PORT || 3000;
    app.listen(port, ()=>{
        console.log(`Server is running on http://localhost:${port}`)
    })
}


module.exports = { startServer, app };