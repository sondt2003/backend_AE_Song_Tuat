
const moment = require("moment");
const { Api403Error } = require("../../core/error.response");

const configVnPay = {
 ipAddr : "127.0.0.1",
 tmnCode : "EPRPY8HH",
 secretKey : "NWVQKRZEKLYJSFJFADHDABKWCAOWEAUU",
 vnpUrl : "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
 returnUrl : "https://delifood.io.vn/api/v1/vnpay/vnpay_return",
 version: "2.1.0"
}



class VnPayService {
  static async createPaymentUrl({ amount, bankCode }) {
    let date = new Date();
    let createDate = moment(date).format("YYYYMMDDHHmmss");
    let ipAddr = configVnPay.ipAddr;
    let tmnCode = configVnPay.tmnCode;
    let secretKey =configVnPay.secretKey
    let vnpUrl = configVnPay.vnpUrl
    let returnUrl =configVnPay.returnUrl
    let orderId = moment(date).format("DDHHmmss");

    let locale = "vn";
    if (locale === null || locale === "") {
      locale = "vn";
    }
    let currCode = "VND";
    let vnp_Params = {};
    vnp_Params["vnp_Version"] = configVnPay.version
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = locale;
    vnp_Params["vnp_CurrCode"] = currCode;
    vnp_Params["vnp_TxnRef"] = orderId;
    vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderId;
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = amount * 100;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;
    vnp_Params["vnp_IpAddr"] = ipAddr;
    vnp_Params["vnp_CreateDate"] = createDate;
    if (bankCode) {
      vnp_Params["vnp_BankCode"] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let querystring = require("qs");
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

    return vnpUrl;
  };

  static checkMac(req){

    let vnp_Params = req.query;
    
    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let tmnCode = configVnPay.tmnCode;
    let secretKey = configVnPay.secretKey;

    let querystring = require('qs');
    let signData = querystring.stringify(vnp_Params, { encode: false });
    let crypto = require("crypto");
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex");

    if(secureHash === signed){
      return "Thanh toán thành công!"
    } else{
      throw new Api403Error('sai chữ kí');
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
