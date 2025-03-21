const express = require('express');
const router = express.Router();
const { restrictToLoginUserOnly } = require('../middleware/auth')
const { applyForNewParty, getApplyForNewParty, applyForCandidate, getApplyForCandidate, getCandidateToVote, candidateToVote, seeEligibleVoters } = require('../controllers/voters')
const { handleUserGetData, handleUserUpdate, handleUserGetUpdate, } = require('../controllers/user')
const { homePageEnterAnyUser } = require('../controllers/signup')
const upload = require('../middleware/multer')




// poll vote
router.get('/vote', restrictToLoginUserOnly, getCandidateToVote)
router.post('/submit-vote', restrictToLoginUserOnly, candidateToVote)


// view candidates
router.get("/home", restrictToLoginUserOnly, homePageEnterAnyUser);


router.get('/profile', restrictToLoginUserOnly, handleUserGetData)
router.post('/profile-update', restrictToLoginUserOnly, upload.single('image'), handleUserUpdate);
router.get('/profile-update', handleUserGetUpdate)
router.post('/create-party', restrictToLoginUserOnly, upload.single('image'), applyForNewParty)
router.get('/create-party', restrictToLoginUserOnly, getApplyForNewParty);
router.post('/apply-for-candidate', restrictToLoginUserOnly, applyForCandidate)
router.get('/apply-for-candidate', restrictToLoginUserOnly, getApplyForCandidate)

router.get('/', restrictToLoginUserOnly, seeEligibleVoters)

router.get('/logout',restrictToLoginUserOnly,(req, res)=>{
    res.clearCookie('vToken');
    res.redirect('/login')
})





router.post('/*', (req, res) => {
    res.redirect('/login');
})


module.exports = router;