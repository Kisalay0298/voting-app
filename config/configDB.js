const mongoose = require('mongoose');

require('dotenv').config();
async function connect(){
    try{
        await mongoose.connect(`${ process.env.MONGODB_URI }/votingApp`)
        .then(()=> console.log("MongoDB Connected"))
    }catch(err){
        console.log('Oops! something went wrong..');
        console.error(err);
    }
}

module.exports = connect;