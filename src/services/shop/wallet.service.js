const Wallet = require("../../models/wallet.model");
const Shop = require("../../models/shop.model");
const {
  Api404Error,
  Api409Error,
  Api401Error,
} = require("../../core/error.response");

class WalletService {
  static async Depositing(userId, amount) {
    try {
      const shop = await Shop.findOne({ _id: userId });

      if (!shop) {
        throw new Api404Error("Shop not found");
      }

      const wallet = await Wallet.findOneAndUpdate(
        { _id: shop.wallet },
        { $inc: { balance: amount } },
        { new: true }
      );

      return wallet;
    } catch (error) {
      console.error("Error depositing amount:", error);
      throw new Api404Error("Failed to deposit amount");
    }
  }

  static async Payoff(userId, amount) {
    try {
      const shop = await Shop.findOne({ _id: userId });

      if (!shop) {
        throw new Api404Error("Shop not found");
      }

      const wallet = await Wallet.findOneAndUpdate(
        { _id: shop.wallet, balance: { $gte: amount } },
        { $inc: { balance: -amount } },
        { new: true }
      );

      if (!wallet) {
        throw new Api404Error("Insufficient balance for payoff");
      }

      return wallet;
    } catch (error) {
      console.error("Error paying off amount:", error);
      throw new Api404Error("Failed to pay off amount");
    }
  }
  static async GetBalance(userId) {
    try {
      const shop = await Shop.findOne({ _id: userId }).populate("wallet");

      if (!shop) {
        // Handle the case where the shop is not found
        throw new Api404Error("Shop not found");
      }

      if (!shop.wallet) {
        // If wallet not found, create a new wallet and link it to the shop
        const newWallet = await Wallet.create({ balance: 0, transactions: [], currency: "VND" });
        shop.wallet = newWallet._id;
        await shop.save();
                
        return newWallet;
      }

      return shop.wallet;
    } catch (error) {
      // Handle any errors that might occur while getting the balance
      console.error("Error getting balance:", error);
      throw new Api409Error("Failed to get balance");
     
    }
  }
}

module.exports = WalletService;
