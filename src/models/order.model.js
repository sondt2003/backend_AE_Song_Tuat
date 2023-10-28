const {model, Schema} = require("mongoose");

const DOCUMENT_NAME = 'Order';
const COLLECTION_NAME = 'Orders';

const orderSchema = new Schema({
    order_userId:{type: Schema.Types.ObjectId,
        ref: 'Shop'},
    order_checkout:{type:Object,default:{}},
   /* order_checkout={
        totalPrice,
        totalApplyDiscount,
        feeShip,
    }*/
    order_shipping:{type:Object,default:{}},
       /* order_shipping={
        street,
        city,
        state,
        country,
    }*/
    order_payment:{type:Object,default:{}},
    order_products:{type:Array,required:true},
    order_trackingNumber:{type:String,default:"#000011237128"},
    order_status: {
        type: String,
        require: true,
        enum: ['pending', 'confirmed', 'shipped', 'canceled','delivered'],
        default: 'pending'
    },
    //pending dơn hàng đang chờ  đã được tạo nhưng chưa được sử lý
    //confirmed dơn hàng đã được xử lý và xác nhận bởi người bán
    //shipped dơn hàng đã được vận chuyển và trên dường đến nơi
    //canceled dơn hàng đã bị hủy bởi khác hàng hoặc người bán
    //delivered đơn hàng đã giao tới khách hàng
}, {
    collection: COLLECTION_NAME,
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    },
});

module.exports = model(DOCUMENT_NAME, orderSchema)