const express = require('express');
const router = express.Router();
// const { signupLogic } = require('../controllers/login')
const { handleUserSignup, handleUserLogin, signupLogic, loginLogic } = require('../controllers/signup')

// homePage
// router.get('/', homePageEnterAnyUser)


// create a new user
router.get("/signup", signupLogic)
router.post('/signup', handleUserSignup);

// view candidates
// router.get("/candidates", homePageEnterAnyUser);

// login user
router.get("/login", loginLogic)
router.post('/login', handleUserLogin);




module.exports= router;