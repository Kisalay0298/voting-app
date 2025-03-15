const LoginModel = require('../model/voter')
const jwt = require('jsonwebtoken');
const { connectCloudinary, cloudinary } = require('../config/cloudinary'); 
connectCloudinary();
const candidateModel = require('../model/candidate')

// get user profile
async function handleUserGetData(req, res) {
    try {
        const decoded = req.user._id
        const user = await LoginModel.findById(decoded._id).select('-password -__v'); 
        if (!user) {
            return res.redirect('/login')
        }

        const candidates = await candidateModel.find({});
        const voter = await LoginModel.find({});

        res.render('profile', { user,  candidates, voter })

    } catch (err) {
        console.error('Error:', err);
        return res.redirect('/login?message=Internal Server Error!&type=error');
    }
}


async function handleUserUpdate(req, res) {
    try {

        const decoded = req.user.id
        const user = await LoginModel.findById(decoded).select('-password -hasVoted -__v'); 

        if (!user) {
            return res.redirect('/login')
        }

        const { name, address, email, password } = req.body;
        const imageFile = req.file;

        if (name) user.name = name;
        if (address) user.address = address;
        if (email) user.email = email;
        if (password) user.password = password;

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: 'image'});
            const imageURL = imageUpload.secure_url
            user.image= imageURL
        }
        
        await user.save();
        return res.redirect('/voter/profile?message=Profile updated successfully&type=success');
        
    } catch (err) {
        console.error('Error:', err);
        return res.redirect('/login?message=Internal Server Error!&type=error');
    }
}



// handleUserGetUpdate
async function handleUserGetUpdate(req, res) {
    try {
        const token = req.cookies?.vToken;

        if (!token) {
            res.redirect('/login')
            return res.redirect('/login?message=Unauthorized user. Access denied!&type=error');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await LoginModel.findById(decoded._id).select('-password -__v');
        if (!user) {
            return res.redirect('/login?message=No user found!&type=error');
        }

        res.render('update_profile', { user })

    } catch (error) {
        console.error('Error:', error);
        return res.redirect('/voter/home?message=Internal Server Error!&type=error');
    }
}







module.exports={
    handleUserGetData,
    handleUserUpdate,
    handleUserGetUpdate
}