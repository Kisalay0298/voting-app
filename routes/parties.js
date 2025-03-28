const express = require('express');
const router = express.Router();
const partyModel = require('../model/party'); // Import the Party model



router.get('/parties', async (req, res) => {
    try {
        const { currentParty } = req.query; // Get current party name from query
        const filter = currentParty ? { name: { $ne: currentParty } } : {}; // Exclude if provided

        const parties = await partyModel.find(filter, { name: 1, symbol: 1, _id: 0 }); // Fetch name and symbol
        res.status(200).json({ success: true, data: parties });
    } catch (error) {
        console.error('Error fetching parties:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});



router.post('/parties', async (req, res) => {
    try {
        const { name, leader, foundedYear } = req.body;

        // Check if a party with the same name exists
        const existingParty = await partyModel.findOne({ name });
        if (existingParty) {
            return res.status(400).json({ message: 'Party already exists' });
        }

        // Create a new party entry
        const newParty = new partyModel({
            name,
            leader,
            foundedYear
        });

        await newParty.save();
        res.status(201).json({ message: 'Party created successfully', party: newParty });

    } catch (error) {
        console.error('Error adding new party:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
