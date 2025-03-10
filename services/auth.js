const jwt = require('jsonwebtoken')

function setVoter(user){
    return jwt.sign({
        id: user._id,
        name: user.name,
        hasVoted: user.hasVoted,
        age: user.age,
        role: user.role,
        aadharId: user.aadharId
    }, process.env.JWT_SECRET_KEY)
}

function getVoter(token){
    try{
        if(!token)  return null;
        return jwt.verify(token, process.env.JWT_SECRET_KEY)
    }catch(err){
        return null;
    }
}


module.exports={
    setVoter,
    getVoter
}
