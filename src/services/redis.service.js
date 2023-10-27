const {setnx, expire} = require("../utils/redis.util");
const acquireLockV1 = async (productId, quantity, cartId) => {
    const key = `lock_v2023_${productId}`
    const retryTimes = 10// thời gian thử lại
    const expireTime = 3000// thời gian tạm log

    for(let i = 0; i < retryTimes; i++) {
        const result = await setnx(key, expireTime)
        console.log(`result::`, result)
        if (result === 1) {
            // thao tac voi inventory
            return key;
        } else {
            await new Promise((resolve) => setTimeout(resolve, 50))
        }
    }
}
const releaseLockV1 = async (keyLock) => {
    const delAsyncKey = de
}




const redis=require('redis');
const redisClient=redis.createClient();
const {promisify}=require('util');
const { reservationInventory } = require("../models/repositories/inventory.repo");

const pexpire=promisify(redisClient.pexpire).bind(redisClient)
const setnxAsync=promisify(redisClient.setnx).bind(redisClient)

const acquireLockV2 = async (productId, quantity, cartId) => {
    const key = `lock_v2023_${productId}`
    const retryTimes = 10// thời gian thử lại
    const expireTime = 3000// thời gian tạm log

    for(let i = 0; i < retryTimes; i++) {
        const result = await setnxAsync(key, expireTime)
        console.log(`result::`, result)
        if (result === 1) {
            const isReservation=await reservationInventory({
                productId, quantity, cartId
            })
            if(isReservation.modifiedCount){
                await pexpire(key,expire)// khóa này sẽ được giải phóng trong vòng expire
                return key;
            }
            return null;
        } else {
            await new Promise((resolve) => setTimeout(resolve, 50))
        }
    }
}

const releaseLockV2 = async (keyLock) => {
    const delAsyncKey = promisify(redisClient.del).bind(redisClient);
    return await delAsyncKey;
}
module.exports={
    acquireLockV1,
    releaseLockV1,
    acquireLockV2,
    releaseLockV2
}