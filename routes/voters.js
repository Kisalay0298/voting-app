const express = require('express');
const router = express.Router();
const { restrictToLoginUserOnly } = require('../middleware/auth')
// const { seeAllVoters, renderToVote, submitVotes, voteAnalysis } = require('../controllers/voters')

const { handleUserGetData, handleUserUpdate, handleUserGetUpdate, } = require('../controllers/user')

// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });
const upload = require('../middleware/multer')

router.get('/profile', restrictToLoginUserOnly, handleUserGetData)
// router.post('/profile-update', restrictToLoginUserOnly, handleUserUpdate)
router.post('/profile-update', restrictToLoginUserOnly, upload.single('image'), handleUserUpdate);
router.get('/profile-verify', handleUserGetUpdate)

















// router.get('/', seeAllVoters)
// router.get('/vote', restrictToLoginUserOnly, renderToVote)
// router.post("/vote", restrictToLoginUserOnly, submitVotes)
// router.get("/vote/analysis", restrictToLoginUserOnly, voteAnalysis)

// router.get("/signup", renderSignupToVote)






module.exports = router;