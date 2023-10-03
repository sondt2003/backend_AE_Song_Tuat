const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require('../services/keyToken.service')
const {createTokenPair} = require('../auth/authUtils')
const {getInfoData} = require('../utils')
const {Api403Error, BusinessLogicError, Api401Error} = require("../core/error.response");
const {findByEmail} = require('./shop.service')
const apiKeyModel = require('../models/apikey.model')
const i18n = require('../configs/config.i18n')

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: '001',
    READ: '002',
    DELETE: '003',
    ADMIN: '000'
}

class AccessService {

    /**
     * Check this token used?
     * @param refreshToken
     * @returns {Promise<void>}
     */
    refreshToken = async ({
                            refreshToken,
                            user,
                            keyStore
                          }) => {
        const { userId, email } = user
        console.log({userId, email})

        if (keyStore.refreshTokensUsed.includes(refreshToken)) {
            // notify send email error...

            // delete token in keyStore
            await KeyTokenService.deleteKeyById(userId)
            throw new Api403Error("Có lỗi xảy ra, vui long đăng nhập lại")
        }

        if (refreshToken !== keyStore.refreshToken) throw Api401Error("Thông tin shop đã tồn tại")

        // check userId
        const foundShop = await findByEmail({email})
        if (!foundShop) throw new Api401Error("Token không hợp lệ")

        // create accessToken, refreshToken
        const tokens = await createTokenPair({userId, email}, keyStore.publicKey, keyStore.privateKey)

        // update token
        await keyStore.update({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        })

        // return new tokens
        return {
            user,
            tokens
        }
    }

    /**
     * Action logout
     *
     * @param keyStore
     * @returns {Promise<*>}
     */
    logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)
        console.debug(delKey)
        return delKey;
    }

    /**
     * 1 - Check email in dbs
     * 2 - Match password
     * 3 - Create AT vs RT and save
     * 4 - Generate tokens
     * 5 - Get guide return login
     *
     * @param email
     * @param password
     * @returns {Promise<void>}
     */
    singIn = async ({email, password}) => {
        // 1.
        const foundShop = await findByEmail({email})
        if (!foundShop) throw new Api403Error("Thông tin shop Không tồn tại")

        // 2.
        const match = bcrypt.compare(password, foundShop.password)
        if (!match) throw new BusinessLogicError("Đăng nhập thất bại")

        // 3. create private key, public key
        const {
            publicKey,
            privateKey,
        } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
            },
        });

        // 4. generate tokens
        const {_id: userId} = foundShop
        const tokens = await createTokenPair({
            userId: userId.toString(),
            email
        }, publicKey, privateKey)

        await KeyTokenService.createKeyToken({
            userId: userId.toString(),
            privateKey,
            publicKey,
            refreshToken: tokens.refreshToken,
        })

        //
        return {
            shop: getInfoData({
                fields: ['_id', 'name', 'email'],
                object: foundShop
            }),
            tokens
        }
    }

    signUp = async ({name, email, password, msisdn}) => {
        // step1: check email exists?
        const holderShop = await shopModel.findOne({email}).lean()
        console.log('locale:::', i18n.getLocale())
        if (holderShop) {
            throw new Api403Error("Thông tin shop đã tồn tại")
        }

        const passwordHash = await bcrypt.hash(password, 10)

        const newShop = await shopModel.create({
            name, email, password: passwordHash, msisdn, roles: [RoleShop.SHOP]
        })

        if (!newShop) {
            return null
        }

        // create private key, public key
        const {
            publicKey,
            privateKey,
        } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
            },
        });
        console.log(privateKey, '---', publicKey)

        const publicKeyString = await KeyTokenService.createKeyToken({
            userId: newShop._id,
            publicKey: publicKey.toString(),
            privateKey: privateKey.toString(),
        })

        if (!publicKeyString) {
            throw new BusinessLogicError("Thông tin public key không hợp lệ")
        }
        console.log('publicKeyString:: ', publicKeyString)

        // create pub
        const publicKeyObject = await crypto.createPublicKey(publicKeyString)
        console.log('publicKeyObject:: ', publicKeyObject)

        // created token pair
        const tokens = await createTokenPair(
            {
                userId: newShop._id,
                email
            },
            publicKeyObject,
            privateKey
        )

        console.log('Created token success:: ', tokens)
        // apiKey
        const newKey = await apiKeyModel.create({
            key: crypto.randomBytes(64).toString('hex'), permission: ['0000']
        })

        return {
            shop: getInfoData(
                {
                    fields: ['_id', 'name', 'email', 'msisdn'],
                    object: newShop
                }
            ),
            tokens,
            key: getInfoData(
                {
                    fields: ['key'],
                    object: newKey
                })
        }
    }
}

module.exports = new AccessService()
