const candidateModel = require('../model/candidate')
const voterModel = require('../model/voter')
const partyModel = require('../model/party')
const { pushNotificationJoinParty } = require('../controllers/notifications')


const addNewPCandidate=async (req, res)=>{
    try {
        const {voterId, partyId, candidate, party }=req.body

        if(!voterId || !partyId || !candidate || !manifesto){
            return res.status(400).json({message:"Please fill all the fields"})
        }

        const newCandidate = new candidateModel({
            voterId, partyId, candidate, party
        })
        await newCandidate.save()
        
        res.status(201).json({ message: "Party added successfully" })
        
    } catch (error) {
        console.error('Error:', err);
        return res.redirect('/voter/home?message=Internal Server Error!&type=error');
    }
}



const addNewCandidate = async( party, voter)=>{
    // creating candidate

    if (!party) {
        return res.redirect('/voter/apply-for-candidate?message=Party not found.&type=error');
    }

    console.log("party: ", party._id);

    const newCandidate = new candidateModel({
        voterId: voter._id,
        partyId: party._id,
        candidate: voter,
        party: party,
    });

    const updated = await newCandidate.save();
    return updated
}


const updateCandidate = async (party, voter, existingCandidate) => {
    
    const oldPartyId = existingCandidate.partyId;  // Fix: Get the old party ID correctly
    const oldPartyName = existingCandidate.party.name;

    existingCandidate.voterId = voter._id;
    existingCandidate.partyId = party._id;
    existingCandidate.party = party;

    // Ensure switchHistory exists before pushing
    if (!existingCandidate.switchHistory) {
        existingCandidate.switchHistory = [];
    }

    existingCandidate.switchHistory.push({
        previousPartyId: oldPartyId,
        previousPartyName: oldPartyName,
        switchedAt: Date.now()
    });
    
    const prevParty =  await partyModel.findOne({name: oldPartyName})
    if(prevParty.members.totalVotes > 0){
        prevParty.members.totalVotes -= existingCandidate.voteCount
    }
    await prevParty.save();

    const updated = await existingCandidate.save();  // Fix: Correct async save syntax
    return updated;
};



const updateCandidatePersonalDetails = async ( existingCandidate, user) => {

    // Track changes in name, image, and phone number
    if (user.name !== existingCandidate.candidate.name) {
        existingCandidate.candidate.name = user.name;
    }
    if (user.image !== existingCandidate.candidate.image) {
        existingCandidate.candidate.image = user.image;
    }
    if (user.phone !== existingCandidate.candidate.phone) {
        existingCandidate.candidate.phone = user.phone;
    }
    console.log('candidate function updated successfully ', existingCandidate)

    const updated = await existingCandidate.save();  // Fix: Correct async save syntax
    return updated;
};



module.exports={
    addNewPCandidate,
    addNewCandidate,
    updateCandidate,
    updateCandidatePersonalDetails
}