const _ = require("lodash");
const { Types } = require("mongoose");
const fs = require("fs").promises;
const path = require("path");
const { BusinessLogicError } = require("../core/error.response");
const sharp = require("sharp");

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};

const unGetSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]));
};

const checkEnable = (value) => {
  return value === "true";
};

const convert2ObjectId = (id) => {
  return new Types.ObjectId(id);
};

const removeAttrUndefined = (object) => {
  Object.keys(object).forEach((key) => {
    if (object[key] === undefined || object[key] === null) delete object[key];
  });

  return object;
};

const publicFolderPath = path.resolve(__dirname, "../../public");

const saveBase64Image = async (base64Data, index) => {
  try {
    const ImageName = `image_${Date.now()}_${index}.png`;
    const filePath = path.join(publicFolderPath, ImageName);
    await fs.writeFile(filePath, base64Data.split(";base64,").pop(), "base64");
    console.log("Ảnh đã được lưu tại:", filePath);
    return ImageName;
  } catch (error) {
    throw new BusinessLogicError("Error Save Image");
  }
};

const saveBase64ImageSharp = async ({
  base64Data,
  index,
  width = 500,
  height = 500,
}) => {
  const imageBuffer = Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ""),"base64");
  return await sharp(imageBuffer)
    .resize(parseInt(width), parseInt(height))
    .toBuffer()
    .then(async (resizedBuffer) => {
      console.log("imageBuffer:", imageBuffer);
      const resizedBase64 = resizedBuffer.toString("base64");

      const ImageName = `image_${Date.now()}_${index}.png`;
      const filePath = path.join(publicFolderPath, ImageName);
      await fs.writeFile(
        filePath,
        resizedBase64.split(";base64,").pop(),
        "base64"
      );

      console.log("Ảnh đã được lưu tại:", filePath);
      return ImageName;
    })
    .catch((err) => {
      throw new BusinessLogicError("Error Save Image");
    });
};

async function deleteImage(imageName) {
  const imagePath = path.join(publicFolderPath, imageName);

  try {
    await fs.access(imagePath);
    await fs.unlink(imagePath);
  } catch (error) {
    // throw new BusinessLogicError(`Error deleting image ${imageName}:`, error);
  }
}

const updateNestedObjectParser = (obj) => {
  const final = {};
  Object.keys(obj).forEach((i) => {
    if (typeof obj[i] === "object" && !Array.isArray(obj[i])) {
      const response = updateNestedObjectParser(obj[i]);
      Object.keys(obj[i]).forEach((j) => {
        final[`${i}.${j}`] = response[j];
      });
    } else {
      final[i] = obj[i];
    }
  });

  return final;
};

module.exports = {
  checkEnable,
  getInfoData,
  getSelectData,
  unGetSelectData,
  removeAttrUndefined,
  updateNestedObjectParser,
  convert2ObjectId,
  saveBase64Image,
  deleteImage,
  saveBase64ImageSharp,
};
