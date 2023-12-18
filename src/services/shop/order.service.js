const {findCartById} = require("../../models/repositories/cart.repo");
const {
    BusinessLogicError, Api401Error, Api404Error, Api403Error,

} = require("../../core/error.response");
const {
    checkProductByServer,
    getProductById,
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
    OrderUpdater,
    findAllOrders,
    advancedSearchFilter,
} = require("../../models/repositories/order.repo");
const addressModel = require("../../models/address.model");
const SocketEmitService = require("../../socket.io/EmitService");
const {findByIdShop} = require("./shop.service");
const NotifyUserService = require('../../services/shop/notyfyuser.service')

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
                                    cartId,
                                    userId,
                                    shop_order_ids,
                                    isOrder = false,
                                }) {
        // check cartId exists
        const foundCart = await findCartById(cartId);
        if (!foundCart) throw new Api401Error(`Cart don't exists`);

        const checkout_order = {
                totalPrice: 0, // tong tien hang
                feeShip: 0, // phi van chuyen
                totalDiscount: 0, // tong tien giam gia
                totalCheckout: 0, // tong thanh toan
            },
            shop_order_ids_new = [];

        if (shop_order_ids.length === 0) throw new BusinessLogicError("Không Có Sản Phẩm");

        // calculator bill
        for (let i = 0; i < shop_order_ids.length; i++) {
            const {
                shopId,
                shop_discounts = [],
                item_products = [],
            } = shop_order_ids[i];
            // check product available
            const checkProductServer = await checkProductByServer(item_products);
            if (!checkProductServer[0]) throw new BusinessLogicError("Order invalid");


            // sum total order
            const checkoutPrice = checkProductServer.reduce((acc, product) => {
                return acc + product.quantity * product.price;
            }, 0);

            // total before
            checkout_order.totalPrice += checkoutPrice;
            console.log("Total::::::::::::::::", checkoutPrice)
            console.log("checkout_order::::::::::::::::", checkout_order.totalPrice)

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
                    const {totalPrice, discount = 0} =
                        await DiscountService.getDiscountAmount({
                            codeId: shop_discounts[index].codeId,
                            userId,
                            shopId,
                            products: checkProductServer,
                        });

                    if (isOrder) {
                        await DiscountService.pushUsersUsed({
                            codeId: shop_discounts[index].codeId,
                            userId,
                            shopId,
                        });
                    }
                    checkout_order.totalDiscount += discount;
                    if (discount > 0) {
                        itemCheckout.priceApplyDiscount = (await checkoutPrice) - discount;
                        console.log(
                            "itemCheckout::::::::",
                            itemCheckout.priceApplyDiscount
                        );
                    }
                }
            }

            // tong thanh toan cuoi cung
            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount;
            shop_order_ids_new.push(itemCheckout);
        }

        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order,
        };
    }

    static async orderByUser({
                                 shop_order_ids,
                                 cartId,
                                 userId,
                                 user_address = {},
                                 user_payment = {},
                             }) {
        const {shop_order_ids_new, checkout_order} =
            await OrderService.checkoutReview({
                cartId,
                userId,
                shop_order_ids,
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
            throw new BusinessLogicError(
                "Một Số Sản Phẩm Đã Được Cập Nhật Vui Lòng Quay Lại Rỏ Hàng"
            );
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

    static async orderByUserV2({shop_order_ids, cartId, userId, addressId, user_payment, order_note,}) {
        const {shop_order_ids_new, checkout_order} =
            await OrderService.checkoutReview({
                cartId,
                userId,
                shop_order_ids,
                isOrder: true,
            });

        // // check lai mot lan nua xem ton kho hay k
        // // get new array products
        const products = shop_order_ids_new.flatMap((order) => order.item_products);
        console.log("[1]::", products);
        const acquireProduct = [];
        for (let i = 0; i < products.length; i++) {
            const {productId, quantity} = products[i];
            const isReservation = await reservationInventory({
                productId,
                quantity,
                cartId,
            });
            console.log("modifiedCount", isReservation.modifiedCount);
        }
        if (acquireProduct.includes(false)) {
            throw new BusinessLogicError(
                "Một Số Sản Phẩm Đã Được Cập Nhật Vui Lòng Quay Lại Rỏ Hàng"
            );
        }
        for (let i = 0; i < products.length; i++) {
            const {productId, index} = products[i];
            console.log("CART:::::::", products[i]);
            await CartService.getItemInCart({userId, productId, index});
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
            order_note: order_note,
        });

        if (newOrder) {
            for (let i = 0; i < products.length; i++) {
                const {productId, index} = products[i];
                await CartService.deleteItemInCart({userId, productId, index});
            }
            console.log("--------------------------", newOrder);
            NotifyUserService.notifyOrder({user_id: userId, type_notify: "pending"})

            SocketEmitService.EmitNewOrder({
                order: newOrder,
                shopId: newOrder.order_products[0].shopId,
            });
            return newOrder;
        } else {
            throw new BusinessLogicError("Order không thành công");
        }
    }

    static async getOrderByUser({userId, status, limit = 50, sort = "ctime", page = 1}) {


        return findAllOrders({
            limit, sort, filter: {order_status: status, order_userId: userId}, page,
        });
    }

    static async getOneOrderByUser({userId, orderId}) {
        const foundOrder = await orderModel.findOne({
            order_userId: userId,
            _id: orderId,
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
                order_userId: userId,
                order_status: "pending",
                _id: orderId,
            })
            .setBodyUpdate({
                order_status: "canceled",
                order_reason: reason,
            })
            .executeUpdate();
        if (!updateOrder) {
            throw new BusinessLogicError("Cancel Failed");
        }
        return updateOrder;
    }

    static async cancelOrderByShop({orderId, reason}) {

        console.log("---------------------------------", {
            orderId, reason
        })
        const updateOrder = await new OrderUpdater()
            .setModel(orderModel)
            .setFilter({
                order_status: "pending",
                _id: orderId,
            })
            .setBodyUpdate({
                order_status: "canceled",
                order_reason: reason,
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

    static async updateOrderStatusByShop({
                                             shopId, userId, orderId, status = "confirmed", preStatus = "pending",
                                         }) {
        const foundOrder = await orderModel.findOne({
            _id: orderId,
        });

        if (!foundOrder) {
            throw new BusinessLogicError("Don't have order");
        }

        const updateOrder = await new OrderUpdater()
            .setModel(orderModel)
            .setFilter({
                order_status: preStatus,
                _id: orderId,
            })
            .setBodyUpdate({
                order_status: status,
            })
            .executeUpdate();
        if (!updateOrder) {
            throw new BusinessLogicError(`${status} failed `);
        }
        if (status === "shipping") {
            await this.shippingOrder(updateOrder._id);
        }
        await NotifyUserService.notifyOrder({user_id: userId, type_notify: status})


        return updateOrder;
    }

    static async listOrderStatusByShop({shopId, orderId, limit = 50, sort = "ctime", page = 1, status,}) {
        return await findAllOrders({
            limit,
            sort,
            filter: {"order_products.shopId": shopId, order_status: status},
            page,
        });
    }

    static async shippingOrder(orderID) {
        setTimeout(async () => {
            await new OrderUpdater()
                .setModel(orderModel)
                .setFilter({_id: orderID})
                .setBodyUpdate({
                    order_status: "delivered",
                })
                .executeUpdate();
            //on order success
        }, 10 * 1000);
    }

    static query(query) {
        const {page=1,limit=10}=query;
        let queryStr = JSON.stringify(query);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        queryStr = JSON.parse(queryStr);
        let sort = {};

        const skip = (page - 1) * limit;
      const  _limit = parseInt(limit);

        if (query.sort) {
            const sortByArray = query.sort.split(",");
            sortByArray.forEach((item) => {
                const [field, order] = item.trim().split("-");
                sort[order === undefined ? field : order] =
                    order === undefined ? 1 : -1;
            });
            console.log("sortBy:", sort);
        } else {
            sort={createdAt:-1}
        }
        const matchConditions = {};
        const year = query.year;
        const month = query.month;
        if (year) {
            const startOfYear = new Date(year, 0, 1); // Lọc từ đầu năm
            const endOfYear = new Date(year, 11, 31, 23, 59, 59); // Lọc đến cuối năm

            matchConditions.createdOn = {$gte: startOfYear, $lte: endOfYear};
        }

        if (month) {
            const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
            const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

            matchConditions.createdOn = {$gte: startOfMonth, $lte: endOfMonth};
        }
        return {
            sort,
            limit:_limit,
            skip,
            matchConditions,
        };
    }
static async topQuantity({matchConditions,skip,limit,sort}){
    const foundTopQuantity = await orderModel.aggregate([
        {
            $match: matchConditions,
        },
        {$unwind: "$order_products"},
        {$unwind: "$order_products.item_products"},
        {
            $group: {
                _id: {
                    userId: "$order_userId",
                    productId: "$order_products.item_products.productId",
                },
                totalQuantity: {$sum: "$order_products.item_products.quantity"},
            },
        },
        {
            $group: {
                _id: "$_id.userId",
                topProducts: {
                    $push: {
                        productId: "$_id.productId",
                        totalQuantity: "$totalQuantity",
                    },
                },
                totalQuantityAll: {$sum: "$totalQuantity"},
            },
        },
        {
            $project: {
                _id: 1,
                totalQuantityAll: 1,
            },
        },
        {$skip:skip},
        {$limit: limit},
        {$sort: sort},
    ]);
    return foundTopQuantity;
}


static async topPrice({matchConditions,skip,limit,sort}){
    const foundTopPrice = await orderModel.aggregate([
        {
            $match: matchConditions,
        },
        {$unwind: "$order_products"},
        {
            $group: {
                _id: {
                    userId: "$order_userId",
                    priceRow: "$order_products.priceRow",
                },
                totalPriceAll: {$sum: "$order_products.priceRow"},
            },
        },
        {
            $group: {
                _id: "$_id.userId",
                priceRow: {
                    $push: {
                        priceRow: "$_id.priceRow",
                        totalPriceAll: "$totalPriceAll",
                    },
                },
                totalPriceAll: {$sum: "$totalPriceAll"},
            },
        },
        {
            $project: {
                _id: 1,
                totalPriceAll: 1,
            },
        },
        {$skip:skip},
        {$limit: limit},
        {$sort: sort},
    ]);
    return foundTopPrice;
}

static async topUser({matchConditions,skip,limit,sort}){
    const foundTopUserShop = await orderModel.aggregate([
        {
            $match: matchConditions,
        },
        {$unwind: "$order_products"},
        {
            $group: {
                _id: "$order_userId",
                totalUserAll: {$sum: +1},
            },
        },
        {
            $project: {
                _id: 1,
                totalUserAll: 1,
            },
        },
        {$skip:skip},
        {$limit: limit},
        {$sort: sort},
    ]);
    return foundTopUserShop;
}
    static async topOrder(query) {
        const {sort, limit,skip, matchConditions} = this.query(query);
        matchConditions.order_status = "delivered";

        const foundTopQuantity=await this.topQuantity({sort, limit,skip, matchConditions})
        const foundTopPrice = await this.topPrice({sort, limit,skip, matchConditions})
        const foundTopUserShop = await this.topUser({sort, limit,skip, matchConditions});


        const mergedArray = {};
        for (const item of [...foundTopQuantity, ...foundTopPrice,...foundTopUserShop]) {
            const user = await findByIdShop({_id: item._id});
            const updatedItem = {...user, ...item};
            const {_id, ...rest} = updatedItem;

            mergedArray[_id] = Object.assign(mergedArray[_id] || {}, rest);
        }

        const resultArray = Object.keys(mergedArray).map((_id) => ({
            _id,
            ...mergedArray[_id],
        }));


        return resultArray;
    }

    static async topOrderDetails(query) {
        const {sort, limit,skip, matchConditions} = this.query(query);
        matchConditions.order_status = "delivered";
        
        const matchConditionsFind={
            ...matchConditions,
            "order_products.shopId":query.shopId
        };
        const foundTopQuantity=await this.topQuantity({sort, limit,skip, matchConditions:matchConditionsFind})
        const foundTopPrice = await this.topPrice({sort, limit,skip, matchConditions:matchConditionsFind})
        const foundTopUserShop = await this.topUser({sort, limit,skip, matchConditions:matchConditionsFind});


        const mergedArray = {};
        for (const item of [...foundTopQuantity, ...foundTopPrice,...foundTopUserShop]) {
            const user = await findByIdShop({_id: item._id});
            const updatedItem = {...user, ...item};
            const {_id, ...rest} = updatedItem;

            mergedArray[_id] = Object.assign(mergedArray[_id] || {}, rest);
        }

        const resultArray = Object.keys(mergedArray).map((_id) => ({
            _id,
            ...mergedArray[_id],
        }));


        return resultArray;
    }

    static async topProduct(query) {
        const {sort, limit,skip, matchConditions} = this.query(query);
        matchConditions.order_status = query.status ? query.status : "delivered";

        const foundTopProduct = await orderModel.aggregate([
            {
                $match: matchConditions,
            },
            {$unwind: "$order_products"},
            {$unwind: "$order_products.item_products"},
            {
                $group: {
                    _id: "$order_products.item_products.productId",
                    totalQuantity: {$sum: "$order_products.item_products.quantity"},
                },
            },
            {$sort: sort},
            {
                $project: {
                    _id: 1,
                    totalQuantity: 1,
                    productId: "$_id",
                },
            },
            {$skip:skip},
            {$limit: limit}
        ]);

        const updatedResult = await Promise.all(foundTopProduct.map(async (item) => ({
            _id: item.productId,
            totalQuantity: item.totalQuantity,
            productInfo: await getProductById(item.productId) || {}
        })));

        return updatedResult;
    }

    static async topRevenue({matchConditions,skip,limit,sort}){
      return  await orderModel.aggregate([
            {
                $match: matchConditions,
            },
            {$unwind: "$order_products"},
            {
                $group: {
                    _id: "$order_products.shopId",
                    totalRevenueAll: {$sum: "$order_products.priceRow"},
                },
            },
            {$sort: sort},
            {
                $project: {
                    _id: 1,
                    totalRevenueAll: 1,
                },
            },
            {$skip:skip},
            {$limit: limit}
        ])
    }

    static async topRevenueShop(query) {
        const {sort, limit,skip, matchConditions} = this.query(query);
        matchConditions.order_status = query.status ? query.status : "delivered";

        const foundTopShop =await this.topRevenue({sort, limit,skip, matchConditions});

        const updatedResult = await Promise.all(foundTopShop.map(async (item) => ({
            _id: item._id,
            totalRevenueAll: item.totalRevenueAll,
            shopInfo: await findByIdShop({_id:item._id})
        })));

        return updatedResult;
    }


    static async topRevenueDate({matchConditions,skip,limit,sort,day}){
        const today = new Date();
        matchConditions.createdOn={
            $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + (day-1), 0, 0, 0), // Thứ 2 của tuần
            $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + (day-1) + 1, 0, 0, 0) // Ngày tiếp theo
         }

        const dayOfWeekStartFromMonday = {
            $add: [ { $dayOfWeek: { date: "$createdOn", timezone: "Asia/Ho_Chi_Minh" } }, -1 ]
        };

        return  await orderModel.aggregate([
              {
                  $match: matchConditions,
              },
              {$unwind: "$order_products"},
              {
                  $group: {
                      _id: "$order_products.shopId",
                      totalRevenueAll: {$sum: "$order_products.priceRow"},
                      createdOn: { $first: "$createdOn" },
                  },
              },
              {$sort: sort},
              {
                  $project: {
                      _id: 1,
                      totalRevenueAll: 1,
                      dayOfWeek: {
                        $dayOfWeek: { date: "$createdOn", timezone: "Asia/Ho_Chi_Minh" }
                      }
                  },
              },
              {
                $match: {
                  dayOfWeek: { $gte: 1, $lte: 7 }
                }
              },            
              {$skip:skip},
              {$limit: limit}
          ]);
      }


    static async topRevenueShopDate(query) {
        const {sort, limit,skip, matchConditions} = this.query(query);
        matchConditions.order_status = query.status ? query.status : "delivered";

        const result=[];
        for (let i = 1; i <= 7; i++) {
            const found=await this.topRevenueDate({sort, limit,skip, matchConditions,day:i});
            result.push(...found);
        }
        const updatedResult = await Promise.all(result.map(async (item) => ({
            _id: item._id,
            dayOfWeek: item.dayOfWeek,
            totalRevenueAll: item.totalRevenueAll,
            shopInfo: await findByIdShop({_id:item._id})
        })));

        return updatedResult;
    }
}

module.exports = {OrderService};
