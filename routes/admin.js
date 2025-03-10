const express = require('express');
const router = express.Router();
const { UserProfile } = require('../controllers/user')
const { homePageEnterAnyUser } = require('../controllers/login')
const { addCandidate, viewCandidate, viewAllCandidate, updateCandidate, removeCandidate } = require('../controllers/admin')
const { restrictToLoginUserOnly } = require('../middleware/auth')
const { voteAnalysis } = require('../controllers/voters')

router.get("/vote/analysis", restrictToLoginUserOnly, voteAnalysis)

router.get('/adminPanel', homePageEnterAnyUser);
// router.get('/vote/analysis', homePageEnterAnyUser);

// userProfile
router.get('/profile/:id', UserProfile);

// add a new candidate
router.post('/addCandidate', addCandidate);
router.get("/addCandidate", (req, res)=>{
    return res.render("addCandidates");
})


// view all candidate
router.get('/viewAllCandidates', viewAllCandidate);

// view candidate
router.get('/viewCandidate/:id', viewCandidate);

// update candidate
router.put('/updateCandidate/:id', updateCandidate);
// remove candidate
router.delete('/removeCandidate/:id', removeCandidate);



module.exports= router;