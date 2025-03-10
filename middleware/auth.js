const jwt = require('jsonwebtoken')
const { getVoter } = require('../services/auth');
async function restrictToLoginUserOnly(req, res, next){
    const token = req.cookies.vToken;

    if(!token){
        return res.redirect('/login');
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const voter = await getVoter(decoded.id);
        req.voter = voter;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized user!" });
    }
}


async function restrictToAdminOnly(req, res, next){
    const voterId = req.cookies?.uid;

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