const express = require('express');
const router = express.Router();
const { restrictToLoginUserOnly } = require('../middleware/auth')
const { voteAnalysis } = require('../controllers/admin')

router.get("/vote/analysis", restrictToLoginUserOnly, voteAnalysis)

// router.get('/adminPanel', homePageEnterAnyUser);
// router.get('/vote/analysis', homePageEnterAnyUser);

// userProfile

// add a new candidate


// view all candidate

// view candidate

// update candidate
// remove candidate



module.exports= router;