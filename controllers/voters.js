const voterModel = require('../model/voter')
const jwt = require('jsonwebtoken')
const partyModel = require('../model/party')
const candidateModel = require('../model/candidate')
const { connectCloudinary, cloudinary } = require('../config/cloudinary'); 
connectCloudinary();
// vote

// can see candidates


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




// apply for new candidate
// const applyForCandidate = async (req, res)=>{
//     try {

//         const voterId = req.user._id;
//         const alreadyCandidate = await candidateModel.findOne({voterId})
//         if(alreadyCandidate){
//             await candidateModel.deleteOne({ _id: alreadyCandidate._id })
//         }
//         const voter = await voterModel.findById(voterId).select('-password -__v -qrCode -hasVoted')
//         const {partyName} = req.body
//         const party = await partyModel.findOne({name: partyName}).select('-leader -__v -formedBy -members -totalVotes -status -result -electionYear -createdAt')
//         console.log("party: ",party._id)
        
//         const newCandidate = new candidateModel( {
//             voterId: voter._id,
//             partyId: party._id,
//             candidate: voter,
//             party: party,
//         })
        
//         const updated = await newCandidate.save()
//         if(updated){
//             res.redirect('profile')
//         }else{
//             res.redirect('/apply-for-candidate')
//         }
        
//     } catch (err) {
//         console.error('Error:', err);
//         res.status(500).json({ message: "Internal Server Error", error: err.message });
//     }
// }
const axios = require('axios'); // Import axios

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



// const getApplyForNewParty = async (req, res)=>{
//     try {

//         const decoded = req.user._id
//         const user = await voterModel.findById(decoded._id).select('-password -__v'); 
//         if (!user) {
//             return res.redirect('/login')
//         }

//         res.render('create-party', { user, error: null });
        
//     } catch (error) {
//         console.error("Error:", error);
//         res.status(500).json({ message: "Internal Server Error", error: error.message });
//     }
// }
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
    getApplyForNewParty
}