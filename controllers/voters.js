const voterModel = require('../model/voter')
const jwt = require('jsonwebtoken')
const partyModel = require('../model/party')
const candidateModel = require('../model/candidate')
const { connectCloudinary, cloudinary } = require('../config/cloudinary'); 
connectCloudinary();
// vote

// can see candidates


// form new party
const applyForNewParty = async (req, res) => {
    try {

        const voterId = req.user._id;

        const voter = await voterModel.findById(voterId).select('-password -__v -qrCode -hasVoted -role -isVerified');
        
        if(voter.age < 23 ){
            res.status(401).json({message: "You are not elegible to form a party" });
        }

        if (!voter) {
            return res.status(404).json({ message: "Voter not found" });
        }

        const { name, manifesto } = req.body;
        const imageFile = req.file;
        let imageURL = null;

        const existingParty = await partyModel.findOne({name})
        if(existingParty){
            res.status(400).json({message: "Party-name already exists" })
        }

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
            imageURL = imageUpload.secure_url;
        }

        const party = new partyModel({
            leader: voter._id,
            formedBy: voter,
            members: [{candidate: voter, votes: 0}],
            status: [{}],
            name: name,
            manifesto: manifesto,
            symbol: imageURL
        });

        await party.save();
        res.json({ message: "Party created successfully" });

    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};


// apply for new candidate
const applyForCandidate = async (req, res)=>{
    try {

        const voterId = req.user._id;
        const voter = await voterModel.findById(voterId).select('-password -__v -qrCode -hasVoted')
        const {partyName} = req.body
        const party = await partyModel.findOne({name: partyName}).select('-leader -formedBy -members -totalVotes -status -result -electionYear -createdAt')

        const newCandidate = new candidateModel( {
            voterId: voter._id,
            partyId: party._id,
            candidate: voter,
            party: party,
        })

        await newCandidate.save()
        res.json({ message: `Candidate added successfully int the party ${partyName}`});
        
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
}


const getApplyForCandidate = async (req, res) => {
    try {
        const user = req.user._id;  // ✅ Now uses the authenticated user
        const userApplying = await voterModel.findById(user);
        
        res.render("requestForCandidate", { userApplying });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};




// can view results after election result



module.exports={
    applyForNewParty,
    applyForCandidate,
    getApplyForCandidate
}