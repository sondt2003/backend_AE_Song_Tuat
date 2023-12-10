const {findCartById} = require("../../models/repositories/cart.repo");
const {
    BusinessLogicError, Api401Error, Api404Error,
} = require("../../core/error.response");
const {
    checkProductByServer, getProductById,
} = require("../../models/repositories/product.repo");
const {DiscountService} = require("./discount.service");
const {acquireLockV2, releaseLockV2} = require("../redis.service");
const orderModel = require("../../models/order.model");
const {CartService} = require("./cart.service");
const {
    reservationInventory,
} = require("../../models/repositories/inventory.repo");
const {convert2ObjectId} = require("../../utils");
const {
    OrderUpdater, findAllOrders,
} = require("../../models/repositories/order.repo");
const addressModel = require("../../models/address.model");
const SocketEmitService = require("../../socket.io/EmitService")

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
    static async checkoutReview({cartId, userId, shop_order_ids, isOrder = false}) {
        // check cartId exists
        const foundCart = await findCartById(cartId);
        if (!foundCart) throw new Api401Error(`Cart don't exists`);

        const checkout_order = {
            totalPrice: 0, // tong tien hang
            feeShip: 0, // phi van chuyen
            totalDiscount: 0, // tong tien giam gia
            totalCheckout: 0, // tong thanh toan
        }, shop_order_ids_new = [];

        // calculator bill
        for (let i = 0; i < shop_order_ids.length; i++) {
            const {
                shopId, shop_discounts = [], item_products = [],
            } = shop_order_ids[i];
            // check product available
            const checkProductServer = await checkProductByServer(item_products);
            if (!checkProductServer[0]) throw new BusinessLogicError("Order invalid");

            // sum total order
            const checkoutPrice = checkProductServer.reduce((acc, product) => {
                return acc + product.quantity * product.price;
            }, 0);

            // total before
            checkout_order.totalPrice = +checkoutPrice;

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRow: checkoutPrice,
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServer,
            };

            // neu shop_discounts ton tai > 0, check valid
            if (shop_discounts.length > 0) {
                for (let index = 0; index < shop_discounts.length; index++) {
                    const {totalPrice, discount = 0} = await DiscountService.getDiscountAmount({
                        codeId: shop_discounts[index].codeId, userId, shopId, products: checkProductServer,
                    });

                    if (isOrder) {
                        await DiscountService.pushUsersUsed({
                            codeId: shop_discounts[index].codeId, userId, shopId,
                        });
                    }
                    checkout_order.totalDiscount += discount;
                    if (discount > 0) {
                        itemCheckout.priceApplyDiscount = await checkoutPrice - discount;
                        console.log("itemCheckout::::::::",itemCheckout.priceApplyDiscount)
                    }
                }
            }

            // tong thanh toan cuoi cung
            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
            shop_order_ids_new.push(itemCheckout);
        }

        return {
            shop_order_ids, shop_order_ids_new, checkout_order,
        };
    }

    static async orderByUser({
                                 shop_order_ids, cartId, userId, user_address = {}, user_payment = {},
                             }) {
        const {shop_order_ids_new, checkout_order} = await OrderService.checkoutReview({
            cartId, userId, shop_order_ids,
        });

        // check lai mot lan nua xem ton kho hay k
        // get new array products
        const products = shop_order_ids_new.flatMap((order) => order.item_products);
        console.log("[1]::", products);
        const acquireProduct = [];
        for (let i = 0; i < products.length; i++) {
            const {productId, quantity} = products[i];
            const keyLock = await acquireLockV2(productId, quantity, cartId);
            acquireProduct.push(keyLock ? true : false);
            if (keyLock) {
                await releaseLockV2(keyLock);
            }
        }
        if (acquireProduct.includes(false)) {
            throw new BusinessLogicError("Một Số Sản Phẩm Đã Được Cập Nhật Vui Lòng Quay Lại Rỏ Hàng");
        }
        const newOrder = await orderModel.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new,
        });
        if (newOrder) {
            for (let i = 0; i < products.length; i++) {
                const {productId} = products[i];
                await CartService.deleteItemInCart({userId, productId});
            }
            return newOrder;
        } else {
            throw new BusinessLogicError("Order không thành công");
        }
    }

    static async orderByUserV2({shop_order_ids, cartId, userId, addressId, user_payment, order_note}) {
        const {shop_order_ids_new, checkout_order} = await OrderService.checkoutReview({
            cartId, userId, shop_order_ids, isOrder: true,
        });

        // // check lai mot lan nua xem ton kho hay k
        // // get new array products
        const products = shop_order_ids_new.flatMap((order) => order.item_products);
        console.log("[1]::", products);
        const acquireProduct = [];
        for (let i = 0; i < products.length; i++) {
            const {productId, quantity} = products[i];
            const isReservation = await reservationInventory({
                productId, quantity, cartId,
            });
            console.log("modifiedCount", isReservation.modifiedCount);
        }
        if (acquireProduct.includes(false)) {
            throw new BusinessLogicError("Một Số Sản Phẩm Đã Được Cập Nhật Vui Lòng Quay Lại Rỏ Hàng");
        }
        for (let i = 0; i < products.length; i++) {
            const {productId,index} = products[i];
            console.log("CART:::::::",products[i])
            await CartService.getItemInCart({userId, productId,index });
        }
        const order_shipping = await addressModel
            .findOne({_id: addressId, user_id: userId})
            .lean();
        if (!order_shipping) throw new Api404Error("Address not found");

        const newOrder = await orderModel.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: order_shipping,
            order_payment: user_payment,
            order_products: shop_order_ids_new,
            order_note: order_note
        });

        if (newOrder) {
            for (let i = 0; i < products.length; i++) {
                const {productId,index} = products[i];
                await CartService.deleteItemInCart({userId, productId,index});
            }
            console.log("--------------------------", newOrder)
            SocketEmitService.EmitNewOrder({order: newOrder, shopId: newOrder.order_products[0].shopId})
            return newOrder;

        } else {
            throw new BusinessLogicError("Order không thành công");
        }
    }

    static async getOrderByUser({userId, status}) {
        return orderModel.find({
            order_userId: convert2ObjectId(userId), order_status: status,
        });
    }

    static async getOneOrderByUser({userId, orderId}) {
        const foundOrder = await orderModel.findOne({
            order_userId: userId, _id: orderId,
        });
        if (!foundOrder) {
            throw new BusinessLogicError("Don't Have Order");
        }
        return foundOrder;
    }

    static async cancelOrderByUser({userId, orderId, reason}) {
        const updateOrder = await new OrderUpdater()
            .setModel(orderModel)
            .setFilter({
                order_userId: userId, order_status: "pending", _id: orderId,
            })
            .setBodyUpdate({
                order_status: "canceled", order_reason: reason,
            })
            .executeUpdate();
        if (!updateOrder) {
            throw new BusinessLogicError("Cancel Failed");
        }
        return updateOrder;
    }

    static async findOrderById(order_id) {
        return await orderModel.findById(order_id);
    }

    static async updateOrderStatusByShop({shopId, userId, orderId, status = "confirmed", preStatus = "pending",}) {
        const foundOrder = await orderModel.findOne({
            _id: orderId,
        });

        if (!foundOrder) {
            throw new BusinessLogicError("Don't have order");
        }

        const updateOrder = await new OrderUpdater()
            .setModel(orderModel)
            .setFilter({
                order_status: preStatus, _id: orderId,
            })
            .setBodyUpdate({
                order_status: status,
            })
            .executeUpdate();
        if (!updateOrder) {
            throw new BusinessLogicError(`${status} failed `);
        }
        if (status === 'shipping') {
            await this.shippingOrder(updateOrder._id)
        }
        return updateOrder;
    }

    static async listOrderStatusByShop({shopId, orderId, limit = 50, sort = "ctime", page = 1, status}) {
        return await findAllOrders({
            limit, sort, filter: {"order_products.shopId": shopId, order_status: status}, page,
        });
    }

    static async shippingOrder(orderID) {
        setTimeout(async () => {
            await new OrderUpdater().setFilter({_id: orderID}).setBodyUpdate({
                order_status: 'delivered',
            }).executeUpdate();
            //on order success
        }, 10 * 1000)
    }
}

module.exports = {OrderService};
