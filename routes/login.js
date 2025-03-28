const express = require('express');
const router = express.Router();
const { handleUserSignup, handleUserLogin, signupLogic, loginLogic } = require('../controllers/signup')
const { getCandidateToVote } = require('../controllers/voters')

// homePage
router.get('/candidates', getCandidateToVote)


// create a new user
router.get("/signup", signupLogic)
router.post('/signup', handleUserSignup);






// login user
router.get("/login", loginLogic)
router.post('/login', handleUserLogin);




module.exports= router;