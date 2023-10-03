const apiKeyModel = require("../models/apikey.model")
const crypto=require("crypto");
const findById = async (key) => {
    // const keyCreate = await apiKeyModel.create({ key: crypto.randomBytes(64).toString('hex'), permissions: ['0000'] }).lean()
    // console.log("key:::::::::::::", keyCreate)
    return await apiKeyModel.findOne({ key, status: true }).lean();
}

module.exports = {
    findById
}