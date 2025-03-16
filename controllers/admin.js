const Candidate = require('../model/candidate');
const Party = require('../model/party');
const Voter = require('../model/voter');

const voteAnalysis = async (req, res) => {
    try {
        const votingData = await someCalculationsToGetData(); // Fetch calculated data

        res.render("analysis", {
            user: req.user,
            votedCount: votingData.votedCount,
            notVotedCount: votingData.notVotedCount,
            candidateNames: JSON.stringify(votingData.candidateNames),
            candidateVotes: JSON.stringify(votingData.candidateVotes),
            partyNames: JSON.stringify(votingData.partyNames),
            partyVotes: JSON.stringify(votingData.partyVotes)
        });

    } catch (error) {
        console.error("Error: ", error);
        return res.redirect('/voter/home?message=Internal Server Error!&type=error');
    }
};

const viewResult = async (req, res) => {
    try {
        const user = req.user;
        await updatePartyVotes(); // Ensure party votes are updated
        const votingData = await someCalculationsToGetDataa();

        if (votingData.partyVotes.length === 0) {
            return res.redirect('/voter/home?message=No votes yet!&type=warning');
        }

        res.render("resultView", {
            user,
            votedCount: votingData.votedCount,
            notVotedCount: votingData.notVotedCount,
            candidateNames: (votingData.candidateNames),
            candidateVotes: (votingData.candidateVotes),
            candidateParties: (votingData.candidateParties),
            partyNames: (votingData.partyNames),
            partyVotes: (votingData.partyVotes),
            candidates: votingData.candidates
        });

    } catch (error) {
        console.error("Error: ", error);
        return res.redirect('/voter/home?message=Internal Server Error!&type=error');
    }
};


const updatePartyVotes = async () => {
    try {
        const voteAggregation = await Candidate.aggregate([
            {
                $group: {
                    _id: "$partyId",
                    totalVotes: { $sum: "$voteCount" },
                    candidates: {
                        $push: {
                            candidate: "$candidate",
                            votes: "$voteCount"
                        }
                    }
                }
            }
        ]);

        for (const voteData of voteAggregation) {
            await Party.findByIdAndUpdate(voteData._id, {
                totalVotes: voteData.totalVotes,
                members: voteData.candidates
            });
        }

    } catch (error) {
        console.error("Error: ", error);
        throw error;
    }
};

const someCalculationsToGetData = async () => {
    try {
        await updatePartyVotes();

        // Fetch total voters count
        const totalVoters = await Voter.countDocuments();

        // Fetch unique voted users
        const votedUsers = await Candidate.aggregate([
            { $unwind: "$votes" },
            { $group: { _id: "$votes.user" } }
        ]);

        const votedCount = votedUsers.length;
        const notVotedCount = totalVoters - votedCount;

        // Fetch candidates sorted by vote count
        const candidates = await Candidate.find({}, "candidate voteCount party")
            .populate("party", "name") 
            .sort({ voteCount: -1 });

        const candidateNames = candidates.map(c => c.candidate.name);
        const candidateVotes = candidates.map(c => c.voteCount);
        const candidateParties = candidates.map(c => c.party?.name || "Independent");

        // Fetch parties sorted by total votes
        const parties = await Party.find({}, "name totalVotes").sort({ totalVotes: -1 });

        const partyNames = parties.map(p => p.name);
        const partyVotes = parties.map(p => p.totalVotes);

        return {
            votedCount,
            notVotedCount,
            candidateNames,
            candidateVotes,
            candidateParties,
            partyNames,
            partyVotes,
            candidates
        };
    } catch (error) {
        console.error("Error fetching voting data:", error);
        throw error;
    }
};

const someCalculationsToGetDataa = async () => {
    try {
        await updatePartyVotes();

        // Fetch total voters count
        const totalVoters = await Voter.countDocuments();

        // Fetch unique voted users
        const votedUsers = await Candidate.aggregate([
            { $unwind: "$votes" },
            { $group: { _id: "$votes.user" } }
        ]);

        const votedCount = votedUsers.length;
        const notVotedCount = totalVoters - votedCount;

        // Fetch candidates sorted by vote count
        const candidates = await Candidate.find({}, "candidate voteCount party")
            .populate("party", "name") 
            .sort({ voteCount: -1 });

        const candidateNames = candidates.map(c => c.candidate?.name || "Unknown");
        const candidateVotes = candidates.map(c => c.voteCount);
        const candidateParties = candidates.map(c => c.party ? c.party.name : "Independent");

        // Fetch parties sorted by total votes
        const parties = await Party.find({}, "name totalVotes").sort({ totalVotes: -1 });

        const partyNames = parties.map(p => p.name);
        const partyVotes = parties.map(p => p.totalVotes);

        return {
            votedCount,
            notVotedCount,
            candidateNames,
            candidateVotes,
            candidateParties,
            partyNames,
            partyVotes,
            candidates,
        };
    } catch (error) {
        console.error("Error fetching voting data:", error);
        throw error;
    }
};


module.exports = {
    voteAnalysis,
    viewResult
};
