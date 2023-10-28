const { findCartById } = require("../models/repositories/cart.repo");
const { Api404Error, BusinessLogicError } = require("../core/error.response");
const { checkProductByServer } = require("../models/repositories/product.repo");
const { DiscountService } = require("./discount.service");
const { acquireLockV2, releaseLockV2 } = require("./redis.service");
const orderModel = require("../models/order.model");
const { CartService } = require("./cart.service");
const { reservationInventory } = require("../models/repositories/inventory.repo");
const { convert2ObjectId } = require("../utils");

class OrderService {

    /*
        {
            cartId,
            userId,
            shop_order_ids: [
                {
                    shopId,
                    shop_discounts: [
                        {
                            shopId,
                            codeId
                        }
                    ],
                    item_products: [
                        {
                            price,
                            quantity,
                            productId
                        }
                    ]
                }
            ]
        }
     */
    static async checkoutReview({
        cartId, userId, shop_order_ids
    }) {
        // check cartId exists
        const foundCart = findCartById(cartId)
        if (!foundCart) throw new Api404Error(`Cart don't exists`)

        const checkout_order = {
            totalPrice: 0, // tong tien hang
            feeShip: 0, // phi van chuyen
            totalDiscount: 0, // tong tien giam gia
            totalCheckout: 0 // tong thanh toan
        }, shop_order_ids_new = []

        // calculator bill
        for (let i = 0; i < shop_order_ids.length; i++) {
            const { shopId, shop_discounts = [], item_products = [] } = shop_order_ids[i]
            // check product available
            const checkProductServer = await checkProductByServer(item_products)
            if (!checkProductServer[0]) throw new BusinessLogicError('Order invalid')

            // sum total order
            const checkoutPrice = checkProductServer.reduce((acc, product) => {
                return acc + (product.quantity * product.price)
            }, 0)

            // total before
            checkout_order.totalPrice = +checkoutPrice

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRow: checkoutPrice,
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServer
            }

            // neu shop_discounts ton tai > 0, check valid
            if (shop_discounts.length > 0) {
                const { totalPrice, discount = 0 } = await DiscountService.getDiscountAmount({
                    codeId: shop_discounts[0].codeId,
                    userId,
                    shopId,
                    products: checkProductServer
                })
                checkout_order.totalDiscount += discount
                if (discount > 0) {
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount
                }
            }

            // tong thanh toan cuoi cung
            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount
            shop_order_ids_new.push(itemCheckout)
        }

        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order
        }
    }

    static async orderByUser({
        shop_order_ids,
        cartId,
        userId,
        user_address = {},
        user_payment = {}
    }) {
        const { shop_order_ids_new, checkout_order } = await OrderService.checkoutReview({
            cartId,
            userId,
            shop_order_ids
        })

        // check lai mot lan nua xem ton kho hay k
        // get new array products
        const products = shop_order_ids_new.flatMap(order => order.item_products)
        console.log('[1]::', products)
        const acquireProduct = [];
        for (let i = 0; i < products.length; i++) {
            const { productId, quantity } = products[i];
            const keyLock = await acquireLockV2(productId, quantity, cartId)
            acquireProduct.push(keyLock ? true : false);
            if (keyLock) {
                await releaseLockV2(keyLock);
            }
        }
        if (acquireProduct.includes(false)) {
            throw new BusinessLogicError("Một Số Sản Phẩm Đã Được Cập Nhật Vui Lòng Quay Lại Rỏ Hàng")
        }
        const newOrder = await orderModel.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new
        });
        if (newOrder) {
            for (let i = 0; i < products.length; i++) {
                const { productId } = products[i];
                await CartService.deleteItemInCart({ userId, productId });
            }
            return newOrder;
        } else {
            throw new BusinessLogicError("Order không thành công")
        }
    }
    static async orderByUserV2({
        shop_order_ids,
        cartId,
        userId,
        user_address = {},
        user_payment = {}
    }) {
        console.log("Order::::::::::::");
        const { shop_order_ids_new, checkout_order } = await OrderService.checkoutReview({
            cartId,
            userId,
            shop_order_ids
        })

        // // check lai mot lan nua xem ton kho hay k
        // // get new array products
        const products = shop_order_ids_new.flatMap(order => order.item_products)
        console.log('[1]::', products)
        const acquireProduct = [];
        for (let i = 0; i < products.length; i++) {
            const { productId, quantity } = products[i];
            const isReservation=await reservationInventory({
                productId, quantity, cartId
            })
            console.log("modifiedCount",isReservation.modifiedCount)
        }
        if (acquireProduct.includes(false)) {
            throw new BusinessLogicError("Một Số Sản Phẩm Đã Được Cập Nhật Vui Lòng Quay Lại Rỏ Hàng")
        }
        const newOrder = await orderModel.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new
        });
        if (newOrder) {
            for (let i = 0; i < products.length; i++) {
                const { productId } = products[i];
                await CartService.deleteItemInCart({ userId, productId });
            }
            return newOrder;
        } else {
            throw new BusinessLogicError("Order không thành công")
        }
    }
    static async getOrderByUser({userId}) {
        const orderFound=await orderModel.find({order_userId:convert2ObjectId(userId)});
        return orderFound;
    }

    static async getOneOrderByUser() {

    }

    static async cancelOrderByUser() {

    }

    static async updateOrderStatusByShop() {

    }
}

module.exports = { OrderService };