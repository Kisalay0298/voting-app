const mongoose = require('mongoose');


const candidateSchema = new mongoose.Schema({
    voterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'voters',
        required: true,
        unique: true
    },
    partyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'parties',
        required: true,
        unique: true
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
            type: mongoose.Schema.Types.ObjectId,
            ref: 'voter',
            unique: true
        },
        votedAt: {
            type: Date,
            default: Date.now()
        }
    }],
    voteCount: {
        type: Number,
        default: 0
    }
})


const candidate = mongoose.model('candidate', candidateSchema);
module.exports = candidate;