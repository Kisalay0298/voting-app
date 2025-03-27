const express = require('express');
const router = express.Router();
const { restrictToLoginUserOnly } = require('../middleware/auth')
const { voteAnalysis, viewResult, startElection, setTimer } = require('../controllers/admin')

router.get("/view-analysis", restrictToLoginUserOnly, voteAnalysis)
router.get("/view-result", restrictToLoginUserOnly, viewResult)

// start election
router.post("/start-election", restrictToLoginUserOnly, startElection)
router.post('/set-election-timer', setTimer);

// router.get('/adminPanel', homePageEnterAnyUser);
// router.get('/vote/analysis', homePageEnterAnyUser);

// userProfile

// add a new candidate


// view all candidate

// view candidate

// update candidate
// remove candidate



module.exports= router;