const {model, Schema} = require("mongoose");

const DOCUMENT_NAME = "TransactionHistory";
const COLLECTION_NAME = "TransactionHistories";

const transactionHistorySchema = new Schema(
    {
        order_id: {
            type: Schema.Types.ObjectId,
            ref: "Order",
        },
        user_id: {
            type: Schema.Types.ObjectId,
            ref: "Shop",
        },
        // amount: {
        //     type: String,
        //     required: true,
        // },
        currency: {
            type: String,
            required: true,
        },
        amount: {
            type: String,
            required: true,
        }
        ,
        payment_method: {
            type: String,
            require: true,
            enum: [
                "credit_card",
                "pay_pal",
                "bank_transfer",
                "cash_on_Delivery",
                "cryptocurrency",
                "e_wallets",
                "cheque",
                "mobile_payment",
                'bank_transfer'
            ],
            default: "cash_on_Delivery",
        },
        payment_date_time: {
            type: Date,
            default: Date.now,
        },
        // transaction_id: {
        //   type: String,
        //   required: true,
        // },
        billing_information: {
            type: String,
            required: true,
        },
        comments: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
);

module.exports = model(DOCUMENT_NAME, transactionHistorySchema);
