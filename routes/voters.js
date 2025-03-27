const express = require('express');
const router = express.Router();
const { restrictToLoginUserOnly } = require('../middleware/auth')
const { applyForNewParty, getApplyForNewParty, applyForCandidate, getApplyForCandidate, getCandidateToVote, candidateToVote, seeEligibleVoters } = require('../controllers/voters')
const { handleUserGetData, handleUserUpdate, handleUserGetUpdate, } = require('../controllers/user')
const { homePageEnterAnyUser } = require('../controllers/signup')
const upload = require('../middleware/multer')
const partyModel = require('../model/party')
const candidateModel = require('../model/candidate')



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








// const express = require('express');
// const router = express.Router();
const notificationModule = require('../model/notifications'); // Import your notification model
const mongoose = require('mongoose');

router.get('/feed', restrictToLoginUserOnly, async (req, res) => {
    try {
        // const { id: notificationId } = req.params;
        const notificationId = req.query.id;

        // Validate if notificationId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
            return res.status(400).json({ error: 'Invalid Notification ID' });
        }

        // Find the notification
        const notification = await notificationModule.findById(notificationId);
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        // console.log(notification)
        let party;
        if( notification.from._id){
            const candidate = await candidateModel.findOne({voterId: notification.from._id})
            const partyMod = await partyModel.findById(candidate.partyId).select('symbol manifesto')
            if (candidate) {
                console.log("symbol: ", candidate.symbol)
                party = {
                    symbol: partyMod.symbol,
                    manifesto: partyMod.manifesto
                }; // Assign only the symbol
            }
        }

        // Mark the notification as read
        await notificationModule.findByIdAndUpdate(notificationId, { read: true }, { new: true });

        res.render('feed', { user: req.user, notification, party }); // Render the 'feed' page with the notification data
    } catch (error) {
        console.error('Error fetching notification:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});














// router.post('/*', (req, res) => {
//     res.redirect('/login');
// })


module.exports = router;