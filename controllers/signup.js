const voterModel = require('../model/voter')
const candidateModel = require('../model/candidate')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookie = require('cookie-parser')
require('dotenv').config();

async function handleUserSignup(req, res) {
    try {
        const { name, phone, dob, password, gender, aadharId, confirmPassword } = req.body

        if(password !== confirmPassword){
            return res.status(400).json({message: "Passwords do not match."})
        }

        const existingUser = await voterModel.findOne({aadharId})
        if(existingUser){
            return res.status(400).json({message: "Email already exists."})
        }

        const newUser = {
            name,
            phone,
            dob,
            password,
            aadharId,
            gender
        }

        await voterModel.create(newUser)
        console.log(newUser)
        return res.redirect('/login');

    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};



const handleUserLogin = async (req, res)=>{
    try {

        const { password, loginId } = req.body;

        const findUser = await voterModel.findOne({
            $or: [{ aadharId: loginId }, { phone: loginId }]
        });
        if(!findUser){
            return res.status(400).json({message: "User not found."})
        }
        
        const passwordMatched = await bcrypt.compare(password, findUser.password)
        console.log(passwordMatched)
        if(!passwordMatched){
            return res.status(400).json({message: "Invalid password."})
        }

        const vToken = jwt.sign({ _id: findUser._id, aadharId: findUser.aadharId, role: findUser.role }, process.env.JWT_SECRET_KEY, 
            // { expiresIn: "10m" }
        )
        res.cookie('vToken', vToken, 
            // {httpOnly: true, secure: true, maxAge: 10 * 60 * 1000}
        )

        return res.redirect('/voter/home');
        
    } catch (err) {
        console.error('Error:', err);
        return res.redirect('/login?error=ServerError');
    }
}


const signupLogic = (req, res)=>{
    res.render('signup');
}

const loginLogic = (req, res)=>{
    res.render('login');
}



const homePageEnterAnyUser = async (req, res) => {
    try {

        const candidates = await candidateModel.find({});
        const voter = await voterModel.find({});
        const user = req.user;  // Assuming user info is stored in `req.user` after authentication

        res.render('candidates', { candidates, voter, user });
        
    } catch (error) {
        console.error('Error:', err);
        return res.redirect('/login?error=ServerError');
    }
}




module.exports = {
    handleUserSignup,
    handleUserLogin,
    signupLogic,
    loginLogic,
    homePageEnterAnyUser
}