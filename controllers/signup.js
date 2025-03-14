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
            return res.redirect('/signup?message=Passwords do not match!&type=error');
        }

        const existingUser = await voterModel.findOne({aadharId})
        if(existingUser){
            return res.redirect('/signup?message=Aadhar ID already registered!&type=error');
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
        return res.redirect('/login?message=Signup successful! Please log in.&type=success');

    } catch (err) {
        console.error('Error:', err);
        return res.redirect('/signup?message=Internal Server Error!&type=error')
    }
};


const handleUserLogin = async (req, res) => {
    try {
        const { password, loginId } = req.body;

        const findUser = await voterModel.findOne({
            $or: [{ aadharId: loginId }, { phone: loginId }]
        });

        if (!findUser) {
            return res.redirect('/login?message=User not found&type=error');
        }

        const passwordMatched = await bcrypt.compare(password, findUser.password);
        if (!passwordMatched) {
            return res.redirect('/login?message=Invalid password&type=error');
        }

        const vToken = jwt.sign(
            { _id: findUser._id, aadharId: findUser.aadharId, role: findUser.role },
            process.env.JWT_SECRET_KEY
        );

        res.cookie('vToken', vToken);

        return res.redirect('/voter/home?message=Logged in successfully&type=success');
    } catch (err) {
        console.error('Error:', err);
        return res.redirect('/login?message=Internal Server Error!&type=error');
    }
};



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