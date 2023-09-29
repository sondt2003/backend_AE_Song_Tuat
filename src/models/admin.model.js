const {Schema, mongoose} = require("mongoose");

const DOCUMENT_NAME = 'Admin';
const COLLECTION_NAME = 'Admins';

const adminSchema = new mongoose.Schema({
    f_name: {
        type: String,
        trim: true,
        maxLength: 150,
        require:true
    },
    l_name: {
        type: String,
        trim: true,
        maxLength: 150
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    phone: {
        type: String,
        required: true,
        unique:true
    },
    password: {
        type: String,
        required:true
    },
    image: {
        type: String,
    },
    remember_token: {
        type: String,
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});


module.exports = mongoose.model(DOCUMENT_NAME, adminSchema)