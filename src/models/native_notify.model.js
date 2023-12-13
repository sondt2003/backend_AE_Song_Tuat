const {model, Schema} = require('mongoose');

const notifySchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: "Shop", required: true},
    title: {type: String, required: true},
    message: {type: String, required: true},
    typeNotify: {
        type: String,
        enum: ["pending", "confirmed", "shipping", "canceled", "delivered", "normal"],
        required: true
    },
    orderId: {type: Schema.Types.ObjectId, ref: "Order"}
});
const NotifyModel = model('Notify', notifySchema);

module.exports = NotifyModel;