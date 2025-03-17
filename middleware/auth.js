const jwt = require('jsonwebtoken')
const voterModel = require('../model/voter')
const { getVoter } = require('../services/auth');


async function restrictToLoginUserOnly(req, res, next) {
    

    try {
        const token = req.cookies.vToken;

        if (!token) {
            return res.redirect('/login');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await voterModel.findById(decoded._id)

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;
        
        next();
    } 
    catch (error) {
        return res.status(401).json({ message: "Unauthorized user!" });
    }
}



async function restrictToAdminOnly(req, res, next){
    const voterId = req.cookies.vToken;

    if (!voterId) {
        return res.redirect('/login');
    }

    const voter = getVoter(voterId);

    if (!voter || !voter.role) {
        // Clear the invalid cookie
        res.clearCookie('uid');
        return res.redirect('/login');
    }

    if (voter.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }

    req.voter = voter;  // Attach voter data to the request
    next();
}


module.exports = {
    restrictToLoginUserOnly,
    restrictToAdminOnly
}