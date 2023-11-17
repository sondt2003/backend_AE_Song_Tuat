const adminModel = require("../../models/admin.model");
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const KeyTokenService = require('../keyToken.service');
const { createTokenPair } = require('../../auth/authUtils');
const { getInfoData } = require('../../utils');
const { Api403Error, BusinessLogicError, Api401Error } = require("../../core/error.response");
const apiKeyModel = require('../../models/apikey.model');

const RoleAdmin = {
    ADMIN: 'ADMIN',
    // Define other roles as needed
};

class AdminAccessService {

    async refreshToken({ refreshToken, admin, keyStore }) {
        const { _id: adminId, email } = admin;

        if (keyStore.refreshTokensUsed.includes(refreshToken)) {
            await KeyTokenService.deleteKeyById(adminId);
            throw new Api403Error("There was an error. Please log in again.");
        }

        if (refreshToken !== keyStore.refreshToken) {
            throw new Api401Error("Invalid token information for admin.");
        }

        const foundAdmin = await adminModel.findById(adminId);

        if (!foundAdmin) {
            throw new Api401Error("Invalid token.");
        }

        const tokens = await createTokenPair({ userId: adminId.toString(), email }, keyStore.publicKey, keyStore.privateKey);

        await keyStore.update({
            $set: {
                refreshToken: tokens.refreshToken,
            },
            $addToSet: {
                refreshTokensUsed: refreshToken,
            }
        });

        return {
            admin: getInfoData({
                fields: ["_id", "f_name", "l_name", "email", "phone", "image"],
                object: foundAdmin,
            }),
            tokens,
        };
    }

    async logout(keyStore) {
        const deletedKey = await KeyTokenService.removeKeyById(keyStore._id);
        return deletedKey;
    }

    async signIn({ email, password }) {
        const foundAdmin = await adminModel.findOne({ email });

        if (!foundAdmin) {
            throw new Api403Error("Admin information does not exist.");
        }

        const match = await bcrypt.compare(password, foundAdmin.password);

        if (!match) {
            throw new BusinessLogicError("Login failed.");
        }

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

        const tokens = await createTokenPair({
            userId: foundAdmin._id.toString(),
            email
        }, publicKey, privateKey);

        await KeyTokenService.createKeyToken({
            userId: foundAdmin._id.toString(),
            privateKey: privateKey.toString(),
            publicKey: publicKey.toString(),
            refreshToken: tokens.refreshToken,
        });

        return {
            admin: getInfoData({
                fields: ["_id", "f_name", "l_name", "email", "phone", "image"],
                object: foundAdmin,
            }),
            tokens,
        };
    }

    async signUp({ f_name, l_name, email, password, phone, image }) {
        const existingAdmin = await adminModel.findOne({ email });
        console.log("signUp")
        if (existingAdmin) {
            throw new Api403Error("Admin information already exists.");
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newAdmin = await adminModel.create({
            f_name, l_name, email, password: passwordHash, phone, image, roles: [RoleAdmin.ADMIN]
        });

        if (!newAdmin) {
            return null;
        }

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

        const publicKeyString = await KeyTokenService.createKeyToken({
            userId: newAdmin._id,
            publicKey: publicKey.toString(),
            privateKey: privateKey.toString(),
        });

        if (!publicKeyString) {
            throw new BusinessLogicError("Invalid public key information.");
        }

        const publicKeyObject = await crypto.createPublicKey(publicKeyString);

        const tokens = await createTokenPair(
            {
                userId: newAdmin._id,
                email
            },
            publicKeyObject,
            privateKey
        );

        const newKey = await apiKeyModel.create({
            key: crypto.randomBytes(64).toString('hex'), permission: ['0000']
        });

        return {
            admin: getInfoData(
                {
                    fields: ['_id', 'f_name', 'l_name', 'email', 'phone', 'image'],
                    object: newAdmin
                }
            ),
            tokens,
            key: getInfoData(
                {
                    fields: ['key'],
                    object: newKey
                })
        };
    }
}

module.exports = new AdminAccessService();