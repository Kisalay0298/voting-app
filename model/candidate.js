const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    voterId: {
        type: String,
        ref: 'voters',
        required: true,
        unique: true
    },
    partyId: {
        type: String,
        ref: 'parties',
        required: true
    },
    candidate: {
        type: Object,
        required: true
    },
    party: {
        type: Object,
        required: true
    },
    votes: [{
        user: {
            type: String,
            ref: 'voter',
            unique: true
        },
        votedAt: {
            type: Date,
            default: Date.now
        }
    }],
    voteCount: {
        type: Number,
        default: 0
    },
    switchHistory: [{
        previousPartyId: {
            type: String,
            ref: 'parties'
        },
        previousPartyName: {
            type: String
        },
        switchedAt: {
            type: Date,
            default: Date.now
        }
    }]
});

const candidate = mongoose.model('candidate', candidateSchema);
module.exports = candidate;
