const mongoose = require('mongoose');

const notifySchema = new mongoose.Schema({
    userId: {type: Number, required: true},
    title: {type: String, required: true},
    message: {type: String, required: true},
    typeNotify: {type: String, enum: ["pending", "confirmed", "shipping", "canceled", "delivered","normal"], required: true},
    orderId: {type: Number}
});
const NotifyModel = mongoose.model('Notify', notifySchema);

module.exports = NotifyModel;