const notificationModel = require('../model/notifications'); // Correct import
const voterModel = require('../model/voter')
const axios = require('axios');
const mongoose = require("mongoose");

const postNotification =  async (req, res) => {
    try {
        const { title, message, id } = req.body;

        const from = await voterModel.findById(id).select('-password -phone -gender -dob -role -age -address -__v -qrCode -hasVoted');

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
}

const getNotification = async (req, res) => {
    try {
        console.log('notification pushed')
        const notifications = await notificationModel.find({})
            .populate('from')
            .sort({ createdAt: -1 }); 

        res.json(notifications);  // Send JSON instead of rendering a view
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}




// join any party as candidate
const pushNotificationJoinParty = async (updated, voter, party, olderParty)=> {
    if (updated) {
        // Send a notification after successful candidate application
        try {
            await axios.post(`http://localhost:${process.env.LOCALPORT}/webhook/notifications`, {
                title: "Switch Party Application",
                message: `requested to switch from ${olderParty} to ${party.name}.`,
                id: voter._id
            });
            console.log("Notification sent successfully.");
        } catch (notifyError) {
            console.error("Failed to send notification:", notifyError.message);
        }

    } else {
        return res.redirect('/apply-for-candidate');
    }
}


// join any party as candidate
const pushNotificationJoinPartyNewCandidate = async (updated, voter, party)=> {
    if (updated) {
        // Send a notification after successful candidate application
        try {
            await axios.post(`http://localhost:${process.env.LOCALPORT}/webhook/notifications`, {
                title: "Join a Party Application",
                message: `requested to join ${party.name} party.`,
                id: voter._id
            });
            console.log("Notification sent successfully.");
        } catch (notifyError) {
            console.error("Failed to send notification:", notifyError.message);
        }

    } else {
        return res.redirect('/apply-for-candidate');
    }
}





// Create party as candidate
const pushNotificationCreateParty = async (updated, voter, party) => {
    try {
        await axios.post(`http://localhost:${process.env.LOCALPORT}/webhook/notifications`, {
            title: "New Party Application",
            message: `requested to form new party named "<strong>${party.name}</strong>".`,
            // message: `requested to form ${party.name} party.`,
            id: voter._id
        });
        console.log("Notification sent successfully.");
    } catch (notifyError) {
        console.error("Failed to send notification:", notifyError.message);
    }
};



async function notificationOnProfileUpdate(user) {
    try {
        // Convert user._id to ObjectId if needed
        const userId = new mongoose.Types.ObjectId(user._id);

        // Debugging: Check if notifications exist before updating
        const existingNotifications = await notificationModel.find({ "from._id": userId });
        console.log("Existing notifications:", existingNotifications);

        if (existingNotifications.length === 0) {
            console.log("No notifications found for this user.");
            return;
        }

        // Update notifications
        const updateResult = await notificationModel.updateMany(
            { "from._id": userId },
            {
                $set: {
                    "from.name": user.name,
                    "from.image": user.image
                }
            }
        );

        console.log(`Modified ${updateResult.modifiedCount} notifications.`);
    } catch (err) {
        console.error("Error updating notifications for profile update:", err);
    }
}





module.exports={
    postNotification,
    getNotification,
    pushNotificationJoinParty,
    pushNotificationCreateParty,
    notificationOnProfileUpdate,
    pushNotificationJoinPartyNewCandidate
}