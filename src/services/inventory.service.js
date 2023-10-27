const { BusinessLogicError } = require("../core/error.response");
const inventoryModel = require("../models/inventory.model");
const { getProductById } = require("../models/repositories/product.repo")

class InventoryService  {

    static addStockToInventory = async ({stock,productId,shopId,location="Nguyễn trãi ,Hà Nội"}) => {
        const product=await getProductById(productId);
        if (!product)throw new BusinessLogicError("Sản Phẩm Không Tồn tại");
        const query={inventory_shop_id:shopId,inventory_product_id:productId},
        updateSet={
            $inc:{
                inventory_stock:stock
            },
            $set:{
                inventory_location:location
            }
        },options={upsert:true,new:true};
        return await inventoryModel.findByIdAndUpdate(query,updateSet,options);
    }

}

module.exports = InventoryService