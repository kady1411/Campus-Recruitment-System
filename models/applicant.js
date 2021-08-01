const mongoose = require('mongoose');

const applicantSchema = new mongoose.Schema({

    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    }
})


const Applicant = mongoose.model('Applicant', applicantSchema);

module.exports = Applicant;