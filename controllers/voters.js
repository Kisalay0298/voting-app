const voterModel = require('../model/voter')
const jwt = require('jsonwebtoken')
const partyModel = require('../model/party')
const candidateModel = require('../model/candidate')
const { connectCloudinary, cloudinary } = require('../config/cloudinary'); 
connectCloudinary();
const axios = require('axios');
const mongoose = require("mongoose");





const candidateToVote = async (req, res) => {
    try {
        const candidateId = req.body.selectedCandidate;
        const userId = req.user._id;
        
        console.log("candidateId1:", candidateId);
        console.log("Type of candidateId:", typeof candidateId);

        // Fetch voter and check if they have already voted
        const voter = await voterModel.findById(userId);
        if (!voter) return res.status(404).json({ message: "Voter not found" });
        if (voter.hasVoted) return res.status(400).json({ message: "You have already voted." });

        // Update voter's status
        voter.hasVoted = true;

        // Fetch candidate
            const cd = await candidateModel.findOne({voterId: candidateId});
            if (!cd) {
                console.error("Candidate not found");
                return res.status(404).json({ error: "Candidate not found" });
            }

        // Push vote to array
        cd.votes.push({ user: userId, votedAt: new Date() });

        // Increase vote count
        cd.voteCount += 1;

        // Save updated candidate document
        await cd.save();
        await voter.save(); // Save voter's vote status

        console.log("Vote recorded successfully:", cd);
        res.redirect('/voter/home');

    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};





const getCandidateToVote = async(req, res)=>{
    try {
        // const { candidateId } = req.params;
        const candidates = await candidateModel.find();

        res.render('vote', { candidates, user: req.user });
    } catch (error) {
        res.status(500).send('Error loading candidates');
    }
}

// Form new party
const applyForNewParty = async (req, res) => {
    try {
        const voterId = req.user._id;

        // Fetch voter details and validate existence
        const voter = await voterModel.findById(voterId).select('-password -__v -qrCode -hasVoted -role -isVerified');
        if (!voter) {
            return res.status(404).json({ message: "Voter not found" });
        }

        // Age validation for forming a party
        if (voter.age < 23) {
            return res.status(401).json({ message: "You are not eligible to form a party" });
        }

        const { name, manifesto } = req.body;
        const imageFile = req.file;
        let imageURL = null;

        // Check if the party name already exists
        const existingParty = await partyModel.findOne({ name });
        if (existingParty) {
            return res.status(400).json({ message: "Party name already exists" });
        }

        // Handle image upload
        if (imageFile) {
            try {
                const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
                imageURL = imageUpload.secure_url;
            } catch (uploadError) {
                console.error('Image Upload Error:', uploadError);
                return res.status(500).json({ message: "Failed to upload image" });
            }
        }

        // Create the new party
        const party = new partyModel({
            leader: voter._id,
            formedBy: voter,
            members: [{ candidate: voter, votes: 0 }],
            status: [{ active: true }],
            name,
            manifesto,
            symbol: imageURL
        });

        await party.save();

        // Check if the party creator is already a candidate
        const existingCandidate = await candidateModel.findOne({ voterId: voter._id });
        if (existingCandidate) {
            // Update the candidate's party ID
            existingCandidate.partyId = party._id;
            existingCandidate.party = party;
            await existingCandidate.save();
        }

        res.json({ message: "Party created successfully" });

    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};



const applyForCandidate = async (req, res) => {
    try {
        const voterId = req.user._id;
        const alreadyCandidate = await candidateModel.findOne({ voterId });

        if (alreadyCandidate) {
            await candidateModel.deleteOne({ _id: alreadyCandidate._id });
        }

        const voter = await voterModel.findById(voterId).select('-password -__v -qrCode -hasVoted');
        const { partyName } = req.body;
        const party = await partyModel.findOne({ name: partyName }).select('-leader -__v -formedBy -members -totalVotes -status -result -electionYear -createdAt');

        if (!party) {
            return res.status(404).json({ message: "Party not found" });
        }

        console.log("party: ", party._id);

        const newCandidate = new candidateModel({
            voterId: voter._id,
            partyId: party._id,
            candidate: voter,
            party: party,
        });

        const updated = await newCandidate.save();

        if (updated) {
            // Send a notification after successful candidate application
            try {
                await axios.post(`http://localhost:${process.env.LOCALPORT}/webhook/notifications`, {
                    title: "New Candidate Application",
                    message: `${voter.name} has applied as a candidate for the party ${party.name}.`,
                    id: voter._id
                });
                console.log("Notification sent successfully.");
            } catch (notifyError) {
                console.error("Failed to send notification:", notifyError.message);
            }

            return res.redirect('/voter/home');
        } else {
            return res.redirect('/apply-for-candidate');
        }

    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};



const getApplyForCandidate = async (req, res) => {
    try {
        const user = req.user._id;
        const userApplying = await voterModel.findById(user);
        
        res.render("requestForCandidate", { user: req.user, error: null, userApplying });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};



const getApplyForNewParty = async (req, res)=> {
    try {
        if (!req.user) {
            console.log("User not found in req object.");
            return res.redirect('/login');
        }
        console.log(req.user)
        res.render('create-party', { user: req.user, error: null });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};




// can view results after election result



module.exports={
    applyForNewParty,
    applyForCandidate,
    getApplyForCandidate,
    getApplyForNewParty,
    candidateToVote,
    getCandidateToVote,
}