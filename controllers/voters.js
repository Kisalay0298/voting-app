const voterModel = require('../model/voter')
const jwt = require('jsonwebtoken')
const partyModel = require('../model/party')
const candidateModel = require('../model/candidate')
const { connectCloudinary, cloudinary } = require('../config/cloudinary'); 
connectCloudinary();
const { pushNotificationJoinParty, pushNotificationCreateParty, } = require('../controllers/notifications')
const { addNewCandidate, updateCandidate }= require('../controllers/candidates')



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
        const voter = await voterModel.findById(voterId).select('-password -__v -qrCode -hasVoted -role');
        if (!voter) {
            return res.redirect('/login?message=Voter not found!&type=error');
        }

        // Age validation for forming a party
        if (voter.age < 23) {
            return res.redirect('/voter/home?message=You are not eligible to form a party!&type=error');
        }

        const { name, manifesto } = req.body;
        const imageFile = req.file;
        let imageURL = null;

        // Check if the party name already exists
        const existingParty = await partyModel.findOne({ name });
        if (existingParty) {
            return res.redirect('/voter/create-party?message=Party name already exists!&type=error');
        }

        // Handle image upload
        if (imageFile) {
            try {
                const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
                imageURL = imageUpload.secure_url;
            } catch (uploadError) {
                console.error('Image Upload Error:', uploadError);
                return res.redirect('/voter/create-party?message=Failed to upload image!&type=error');
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

        const newParty = await party.save();

        // Check if the party creator is already a candidate
        let updated;
        const existingCandidate = await candidateModel.findOne({ voterId: voter._id });

        if (existingCandidate) {
            updated = await updateCandidate(newParty, voter, existingCandidate);
        }else{
            updated = await addNewCandidate(newParty, voter)
        }
        
        pushNotificationCreateParty(updated, voter, newParty)

        return res.redirect('/voter/home?message=Party created successfully.&type=success');

    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};



const applyForCandidate = async (req, res) => {
    try {
        const voterId = req.user._id;
        const alreadyCandidate = await candidateModel.findOne({ voterId });
        const { partyName } = req.body;

        const voter = await voterModel.findById(voterId).select('-password -__v -qrCode -hasVoted');
        const party = await partyModel.findOne({ name: partyName }).select('-leader -__v -formedBy -members -totalVotes -status -result -electionYear -createdAt');

        let updated;
        if (alreadyCandidate) {
            updated = await updateCandidate(party, voter, alreadyCandidate);
        }else{
            updated = await addNewCandidate(party, voter)
        }

        // also pushed notification
        pushNotificationJoinParty(updated, voter, party)
        return res.redirect(`/voter/home?message=Requested to join ${party.name} party successfully&type=error`);

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