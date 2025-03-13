const express = require('express');
const router = express.Router();
const { restrictToLoginUserOnly } = require('../middleware/auth')
const {postNotification, getNotification} = require('../controllers/notifications')
// Webhook route to receive notifications and save to DB
router.post('/webhook/notifications', postNotification);


// Route to render notifications sorted by latest timestamp
router.get('/notifications', getNotification );

module.exports = router;
