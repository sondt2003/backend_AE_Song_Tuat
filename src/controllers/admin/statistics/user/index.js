const Shop = require("../../../../models/shop.model");
const {
    Api403Error,
    Api404Error,
    Api401Error,
} = require("../../../../core/error.response");

class StatisticalUserController {
    CountUser = async (req, res) => {
        try {
            // Example statistical queries
            const totalShops = await Shop.countDocuments({roles: ['SHOP']});
            const activeShops = await Shop.countDocuments({status: "active", roles: ['SHOP']});
            const inactiveShops = await Shop.countDocuments({status: "inactive", roles: ['SHOP']});
            const totalUser = await Shop.countDocuments({roles: ['USER']});
            res.json({
                status: 200,
                data: {
                    totalShops,
                    activeShops,
                    inactiveShops, totalUser
                },
            });
        } catch (error) {
            console.error("Error fetching user statistics:", error.message);
            res.status(500).json({error: "Internal Server Error"});
        }
    };
    AllUser = async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 10;

            // Calculate skip value for pagination
            const skip = (page - 1) * pageSize;
            let roleQuery = req.query.role && req.query.role.toUpperCase() == 'SHOP' ? 'SHOP' : 'USER'
            const users = await Shop.find({roles: [roleQuery]}).limit(pageSize).skip(skip);

            users.map((item) => item.isOpen = !(!item.isOpen))

            // Return the list of users
            res.json({
                data: users,
                status: 200,
            });
        } catch (error) {
            console.error("Error fetching user statistics:", error.message);
            res.status(500).json({error: "Internal Server Error"});
        }
    };
}

module.exports = new StatisticalUserController();
