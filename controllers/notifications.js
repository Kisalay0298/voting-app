const notificationModel = require('../model/notifications'); // Correct import
const voterModel = require('../model/voter')


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
        console.log('run')
        const notifications = await notificationModel.find({})
            .populate('from')
            .sort({ createdAt: -1 }); 

        res.json(notifications);  // Send JSON instead of rendering a view
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}


module.exports={
    postNotification,
    getNotification
}