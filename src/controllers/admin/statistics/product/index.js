const Product = require("../../../../models/product.model").product;
const {
  Api403Error,
  Api404Error,
  Api401Error,
} = require("../../../../core/error.response");

class StatisticalProductController {
  CountProduct = async (req, res) => {
    try {
      // Example statistical queries
      const totalProduct = await Product.countDocuments();
      const totalPublished = await Product.countDocuments({
        isPublished: true,
      });
      const totalNon_Published = await Product.countDocuments({
        isPublished: false,
      });

      res.json({
        totalProduct,
        totalPublished,
        totalNon_Published,
      });
    } catch (error) {
      console.error("Error fetching user statistics:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  AllProduct = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 10;

      // Calculate skip value for pagination
      const skip = (page - 1) * pageSize;

      const users = await Product.find().limit(pageSize).skip(skip);

      // Return the list of users
      res.json({
        data: users,status:200
      });
    } catch (error) {
      console.error("Error fetching user statistics:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
}

module.exports = new StatisticalProductController();
