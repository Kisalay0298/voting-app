const express = require('express');
const router = express.Router();
const { restrictToLoginUserOnly } = require('../middleware/auth')
const { applyForNewParty, applyForCandidate, getApplyForCandidate } = require('../controllers/voters')
const { handleUserGetData, handleUserUpdate, handleUserGetUpdate, } = require('../controllers/user')
const upload = require('../middleware/multer')
// const notificationSchema = require('../model/notifications')


// router.post('/webhook/notifications', async (req, res) => {
//     try {
//         const { message } = req.body;
//         console.log("Received new party request:", message);

//         // Save notification in database
//         const newNotification = new notificationSchema({ message });
//         await newNotification.save();

//         res.status(200).json({ message: "Notification saved", data: newNotification });
//     } catch (error) {
//         console.error("Error saving notification:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// router.get('/notifications', async (req, res) => {
//     try {
//         const notifications = await Notification.find().sort({ timestamp: -1 }); // Latest first
//         res.render('notifications', { notifications });
//     } catch (error) {
//         console.error("Error fetching notifications:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });




router.get('/profile', restrictToLoginUserOnly, handleUserGetData)





router.post('/profile-update', restrictToLoginUserOnly, upload.single('image'), handleUserUpdate);
router.get('/profile-verify', handleUserGetUpdate)
router.post('/create-party', upload.single('image'), applyForNewParty)
router.post('/apply-for-candidate', restrictToLoginUserOnly, applyForCandidate)
router.get('/apply-for-candidate', restrictToLoginUserOnly, getApplyForCandidate)






























// const { seeAllVoters, renderToVote, submitVotes, voteAnalysis } = require('../controllers/voters')



// const multer = require('multer');
// const upload = multer({ dest: 'uploads/' });

// router.post('/profile-update', restrictToLoginUserOnly, handleUserUpdate)


















// router.get('/', seeAllVoters)
// router.get('/vote', restrictToLoginUserOnly, renderToVote)
// router.post("/vote", restrictToLoginUserOnly, submitVotes)
// router.get("/vote/analysis", restrictToLoginUserOnly, voteAnalysis)

// router.get("/signup", renderSignupToVote)



router.post('/*', (req, res) => {
    res.redirect('/login');
})


module.exports = router;