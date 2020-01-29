const mongoose = require('mongoose')

const InfoSchema = new mongoose.Schema ({
    title: String,
    situation: String,
    date: String,
    regime: String,
    topic: String,
    author: String,
    title: String,
    program: String,
    transaction: [String],
});

module.exports = mongoose.model('Info', InfoSchema);