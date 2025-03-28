const express = require('express');
const router = express.Router();
const { restrictToLoginUserOnly } = require('../middleware/auth')
const { applyForNewParty, getApplyForNewParty, applyForCandidate, getApplyForCandidate, getCandidateToVote, candidateToVote, seeEligibleVoters } = require('../controllers/voters')
const { handleUserGetData, handleUserUpdate, handleUserGetUpdate, } = require('../controllers/user')
const { homePageEnterAnyUser, logoutLogic } = require('../controllers/signup')
const upload = require('../middleware/multer')
const { feedLogic } = require('../controllers/notifications')


// poll vote
router.get('/vote', restrictToLoginUserOnly, getCandidateToVote)
router.post('/submit-vote', restrictToLoginUserOnly, candidateToVote)

router.get('/', restrictToLoginUserOnly, seeEligibleVoters)

// view candidates
router.get("/home", restrictToLoginUserOnly, homePageEnterAnyUser);


router.get('/profile', restrictToLoginUserOnly, handleUserGetData)
router.post('/profile-update', restrictToLoginUserOnly, upload.single('image'), handleUserUpdate);
router.get('/profile-update', handleUserGetUpdate)
router.post('/create-party', restrictToLoginUserOnly, upload.single('image'), applyForNewParty)
router.get('/create-party', restrictToLoginUserOnly, getApplyForNewParty);
router.post('/apply-for-candidate', restrictToLoginUserOnly, applyForCandidate)
router.get('/apply-for-candidate', restrictToLoginUserOnly, getApplyForCandidate)


router.get('/logout',restrictToLoginUserOnly, logoutLogic)



router.get('/feed', restrictToLoginUserOnly, feedLogic);














router.post('/*', (req, res) => {
    res.redirect('/login');
})


module.exports = router;