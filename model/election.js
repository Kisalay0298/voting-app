const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    electionCommission: {
        type: String,
        required: true
    }
});

const election = mongoose.model('Election', electionSchema);
module.exports = election;
