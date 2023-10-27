const inventoryModel = require('../inventory.model')
const { Types } = require('mongoose')
const { convert2ObjectId } = require('../../utils/index')
const insertInventory = async ({
    productId, shopId, stock, location = 'unKnow'
}) => {
    return await inventoryModel.create({
        inventory_product_id: new Types.ObjectId(productId),
        inventory_location: location,
        inventory_shop_id: new Types.ObjectId(shopId),
        inventory_stock: stock,
    })
}
const reservationInventory = async ({ productId, quantity, cartId }) => {
    const query = {
        inventory_product_id: convert2ObjectId(productId),
        inventory_stock: { $gte: quantity }
    }, updateSet = {
        $inc: {
            inventory_stock: -quantity
        },
        $push: {
            inventory_reservations: {
                quantity,
                productId,
                cartId
            }
        }
    },options={upsert:true,new:true};
    return await inventoryModel.updateOne(query,updateSet,options)
}
module.exports = {
    insertInventory,
    reservationInventory
}