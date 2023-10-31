const queryCategory = async ({ query, limit, skip }) => {
    return await product.find(query)
        .sort({ updateAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec()
}
module.exports={
    
}