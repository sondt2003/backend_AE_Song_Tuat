const Wallet = require("../../models/wallet.model");
const Shop = require("../../models/shop.model");
const {
    Api404Error,
    Api401Error,
} = require("../../core/error.response");
const {TransactionHistoryService} = require("./transaction-history.service");

class WalletService {
    static async Depositing(userId, amount) {
        const shop = await Shop.findOne({_id: userId});
        if (!shop) {
            throw new Api404Error("Shop not found");
        }
        const wallet = await Wallet.findOneAndUpdate(
            {_id: shop.wallet},
            {$inc: {balance: amount}},
            {new: true}
        );
        if (!wallet) {
            throw Api404Error("Wallet not found")
        }
        await TransactionHistoryService.createUserTransactionHistory({
            payment_method: 'bank_transfer',
            currency: 'VND',
            amount: amount,
            userId: userId,
            comments: `Deposit {}`,
            is_recharge: true,
            billing_information: 'Wallet'
        })
        return wallet;
    }

    static async Payoff(userId, amount, order_id) {
        const shop = await Shop.findOne({_id: userId});

        if (!shop) {
            throw new Api404Error("Shop not found");
        }

        const wallet = await Wallet.findById(shop.wallet);
        if (!wallet) {
            throw new Api404Error("Insufficient balance for payoff");
        }

        console.log(Number(wallet.balance) >= Number(amount))
        if (Number(wallet.balance) >= Number(amount)) {

            let res = await Wallet.findOneAndUpdate(
                {_id: shop.wallet, balance: {$gte: amount}},
                {$inc: {balance: -amount}},
                {new: true}
            );

            await TransactionHistoryService.createUserTransactionHistory({
                payment_method: 'bank_transfer',
                currency: 'VND',
                amount: amount,
                userId: userId,
                comments: `Deposit {}`,
                is_recharge: true,
                billing_information: 'Wallet', orderId: order_id
            })

            return wallet;
        } else {
            throw new Api401Error("Insufficient balance");
        }
    }

    static async GetBalance(userId) {
        const shop = await Shop.findOne({_id: userId}).populate("wallet");
        if (!shop) {
            // Handle the case where the shop is not found
            throw new Api404Error("Shop not found");
        }
        if (!shop.wallet) {
            // If wallet not found, create a new wallet and link it to the shop
            const newWallet = await Wallet.create({balance: 0, currency: "VND"});
            shop.wallet = newWallet._id;
            await shop.save();
            return newWallet;
        }
        return shop.wallet;

    }
}

module.exports = WalletService;
