const LoginModel = require('../model/voter')
const jwt = require('jsonwebtoken');
const { connectCloudinary, cloudinary } = require('../config/cloudinary'); 
connectCloudinary();


// get user profile
async function handleUserGetData(req, res) {
    try {
        const token = req.cookies?.vToken;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized! No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await LoginModel.findById(decoded._id).select('-password -__v'); 
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.render('profile', { user })

    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}


async function handleUserUpdate(req, res) {
    try {
        const token = req.cookies?.vToken;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized! No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await LoginModel.findById(decoded._id).select('-password -__v'); 

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { name, address, email, password } = req.body;
        const imageFile = req.file;  // Get uploaded file

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
        return res.redirect('/voter/profile');
        
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}



// handleUserGetUpdate
async function handleUserGetUpdate(req, res) {
    try {
        const token = req.cookies?.vToken;

        if (!token) {
            res.redirect('/login')
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await LoginModel.findById(decoded._id).select('-password -__v');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.render('update_profile', { user })

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}







module.exports={
    handleUserGetData,
    handleUserUpdate,
    handleUserGetUpdate
}