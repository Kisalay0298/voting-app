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
        required: true
    },
    members: [{
        candidate: {
            type: mongoose.Schema.Types.ObjectId,
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


module.exports = mongoose.model('Party', partySchema);
