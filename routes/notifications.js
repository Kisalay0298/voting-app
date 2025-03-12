const express = require('express');
const router = express.Router();
const notificationModel = require('../model/notifications'); // Correct import
const voterModel = require('../model/voter')
const { restrictToLoginUserOnly } = require('../middleware/auth')

// Webhook route to receive notifications and save to DB
router.post('/webhook/notifications', async (req, res) => {
    try {
        const { title, message, id } = req.body; // Ensure you receive title and from

        const from = await voterModel.findById(id)

        if (!title || !message || !from) {
            return res.status(400).json({ error: "Title, message, and from are required" });
        }

        console.log("Received new notification:", { title, message, from });

        // Save notification in the database
        const newNotification = new notificationModel({ title, message, from });
        await newNotification.save();

        res.status(200).json({ message: "Notification saved", data: newNotification });
    } catch (error) {
        console.error("Error saving notification:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// Route to render notifications sorted by latest timestamp
router.get('/notifications', async (req, res) => {
    try {
        console.log('run')
        const notifications = await notificationModel.find({})
            .populate('from')
            // .sort({ createdAt: -1 }); 

        res.json(notifications);  // Send JSON instead of rendering a view
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
