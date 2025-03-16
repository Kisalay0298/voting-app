const Candidate = require('../model/candidate')
const Party = require('../model/party')
const Voter = require('../model/voter')



const voteAnalysis= async (req, res)=>{
    try {
        console.log('function has been called')

        await updatePartyVotes()

        // Fetch total voters count
        const totalVoters = await Voter.countDocuments();

        // Fetch voted users
        const votedUsers = await Candidate.aggregate([
            { $unwind: "$votes" }, // Flatten votes array
            { $group: { _id: "$votes.user" } } // Get unique voted users
        ]);

        const votedCount = votedUsers.length;
        const notVotedCount = totalVoters - votedCount;

        // Fetch candidates and votes
        const candidates = await Candidate.find({}, "candidate voteCount");
        const candidateNames = candidates.map(c => c.candidate.name);
        const candidateVotes = candidates.map(c => c.voteCount);

        // Fetch parties and votes
        const parties = await Party.find({}, "name totalVotes");
        const partyNames = parties.map(p => p.name);
        const partyVotes = parties.map(p => p.totalVotes);

        res.render("analysis", {
            user: req.user,
            votedCount,
            notVotedCount,
            candidateNames: JSON.stringify(candidateNames),
            candidateVotes: JSON.stringify(candidateVotes),
            partyNames: JSON.stringify(partyNames),
            partyVotes: JSON.stringify(partyVotes)
        });
        
    } catch (error) {
        console.log("Error: ",error)
        return res.redirect('/voter/home?message=Internal Server Error!&type=error');
    }
}


const updatePartyVotes = async () => {
    try {
        // Step 1: Get total votes per party
        // const voteAggregation = await candidateModel.aggregate([
        //     {
        //         $group: {
        //             _id: "$partyId",
        //             totalVotes: { $sum: "$voteCount" }
        //         }
        //     }
        // ]);

        // // Step 2: Update each party with aggregated votes
        // for (const voteData of voteAggregation) {
        //     await partyModel.findByIdAndUpdate(voteData._id, { totalVotes: voteData.totalVotes });
        // }

        // console.log("✅ Party votes updated successfully!");
        // Step 1: Get total votes per party and candidate votes
        const voteAggregation = await Candidate.aggregate([
            {
                $group: {
                    _id: "$partyId",
                    totalVotes: { $sum: "$voteCount" },
                    candidates: {
                        $push: {
                            candidate: "$candidate", // Store candidate object
                            votes: "$voteCount"
                        }
                    }
                }
            }
        ]);

        // Step 2: Update each party
        for (const voteData of voteAggregation) {
            await Party.findByIdAndUpdate(voteData._id, {
                totalVotes: voteData.totalVotes,
                members: voteData.candidates // Store candidate-wise votes
            });
        }

        console.log("✅ Party votes and members updated successfully!");

    } catch (error) {
        console.error("❌ Error updating party votes:", error);
    }
};



module.exports = {
    voteAnalysis,
}