const fs = require("fs").promises;
const path = require("path");
const { Api404Error } = require("../core/error.response");

class ImageService {
  static getUrl = async ({ name, res }) => {
    try {
      const imagePath = path.resolve(__dirname, "../../public", name);
      await fs.access(imagePath);

      res.sendFile(imagePath);
    } catch (error) {
      throw new Api404Error("Image not found");
    }
  };
}

module.exports = ImageService;
