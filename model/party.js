const mongoose = require('mongoose');

const partySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    symbol: {
        type: String,
        required: true
    },
    leader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'voters',
    },
    formedBy: {
        type: Object,
        required: true
    },
    members: [{
        candidate: {
            type: Object,
            ref: 'voters', // Candidate should be a registered user
            required: true
        },
        votes: {
            type: Number,
            default: 0
        }
    }],
    totalVotes: {
        type: Number,
        default: 0
    },
    status: [{ 
        formationStatus:{
            type: String, 
            enum: ["pending", "approved", "rejected"], 
            default: "pending" 
        },
        formedAt: {
            type: Date,
            default: Date.now
        }
    }],
    result: {
        type: String,
        enum: ['won', 'lost', 'pending'],
        default: 'pending'
    },
    electionYear: {
        type: Number,
        required: true,
        default: new Date().getFullYear()
    },
    manifesto: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const party = mongoose.model('Party', partySchema);
module.exports = party
