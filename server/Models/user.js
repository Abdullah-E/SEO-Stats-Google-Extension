const mongoose = require('mongoose');
const findOrCreate = require('mongoose-findorcreate')

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    email: {
        type: String,
        required: true
    },
    familyName: {
        type: String,
        required: true
    },
    givenName: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String
    },
    name: {
        type: String,
        required: true
    }
});

UserSchema.plugin(findOrCreate);

module.exports = mongoose.model('User', UserSchema);