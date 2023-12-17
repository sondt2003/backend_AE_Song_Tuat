const moment = require("moment");
const {Api403Error} = require("../../core/error.response");
const WalletService = require("./wallet.service");

const configVnPay = {
    ipAddr: "127.0.0.1",
    tmnCode: "EPRPY8HH",
    secretKey: "NWVQKRZEKLYJSFJFADHDABKWCAOWEAUU",
    vnpUrl: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    returnUrl: "https://delifood.io.vn/api/v1/vnpay/vnpay_return",
    version: "2.1.0",
};

const TypePayment = {
    DEPOSIT: "DEPOSIT",
    PAYMENT_ORDER: "PAYMENT ORDER",
};

class RequestPayment {
    constructor(typePayment, userId, amount, vnp_TxnRef) {
        this.typePayment = typePayment;
        this.userId = userId;
        this.amount = amount;
        this.vnp_TxnRef = vnp_TxnRef
    }
}

var ListRequest = [];

class VnPayService {
    static async createPaymentUrl({amount, bankCode, userId, typePayment}) {
        if (
            typePayment !== TypePayment.DEPOSIT &&
            typePayment !== TypePayment.PAYMENT_ORDER
        ) {
            throw new Api403Error("không có type thanh toán");
        }
        let date = new Date();
        let createDate = moment(date).format("YYYYMMDDHHmmss");
        let ipAddr = configVnPay.ipAddr;
        let tmnCode = configVnPay.tmnCode;
        let secretKey = configVnPay.secretKey;
        let vnpUrl = configVnPay.vnpUrl;
        let returnUrl = configVnPay.returnUrl;
        let orderId = moment(date).format("DDHHmmss");

        let locale = "vn";
        if (locale === "") {
            locale = "vn";
        }
        let currCode = "VND";
        let vnp_Params = {};
        vnp_Params["vnp_Version"] = configVnPay.version;
        vnp_Params["vnp_Command"] = "pay";
        vnp_Params["vnp_TmnCode"] = tmnCode;
        vnp_Params["vnp_Locale"] = locale;
        vnp_Params["vnp_CurrCode"] = currCode;
        vnp_Params["vnp_TxnRef"] = orderId;
        vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderId;
        vnp_Params["vnp_OrderType"] = "other";
        vnp_Params["vnp_Amount"] = amount  * 100;
        vnp_Params["vnp_ReturnUrl"] = returnUrl;
        vnp_Params["vnp_IpAddr"] = ipAddr;
        vnp_Params["vnp_CreateDate"] = createDate;
        if (bankCode) {
            vnp_Params["vnp_BankCode"] = bankCode;
        }
        vnp_Params = sortObject(vnp_Params);

        let querystring = require("qs");
        let signData = querystring.stringify(vnp_Params, {encode: false});
        let crypto = require("crypto");
        let hmac = crypto.createHmac("sha512", secretKey);
        vnp_Params["vnp_SecureHash"] = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

        ListRequest = [...ListRequest, new RequestPayment(typePayment, userId, amount, orderId)];

        vnpUrl += "?" + querystring.stringify(vnp_Params, {encode: false});

        return vnpUrl;
    }

    static checkMac(req) {
        let vnp_Params = req.query;
        let secureHash = vnp_Params["vnp_SecureHash"];
        let vnp_TxnRef = vnp_Params["vnp_TxnRef"]
        delete vnp_Params["vnp_SecureHash"];
        delete vnp_Params["vnp_SecureHashType"];

        vnp_Params = sortObject(vnp_Params);

        let tmnCode = configVnPay.tmnCode;
        let secretKey = configVnPay.secretKey;

        let querystring = require("qs");
        let signData = querystring.stringify(vnp_Params, {encode: false});
        let crypto = require("crypto");
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");

        if (secureHash === signed) {
            let indexDelete;
            let request = ListRequest.find((value, index) => {
                indexDelete = index;
                return value.vnp_TxnRef === vnp_TxnRef;
            });
            if (request) {
                if (request.typePayment === TypePayment.DEPOSIT) {
                    WalletService.Depositing(request.userId, request.amount);
                    ListRequest = ListRequest.slice(indexDelete, 1);
                    return "Thanh toán thành công!";
                } else {
                    throw new Api403Error('Lỗi giao dịch ,vui lòng thao tác lại');
                }

            } else {
                throw new Api403Error('Lỗi giao dịch ,vui lòng thao tác lại');
            }
        } else {
            throw new Api403Error("sai chữ kí");
        }
    }
}

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

module.exports = VnPayService;
