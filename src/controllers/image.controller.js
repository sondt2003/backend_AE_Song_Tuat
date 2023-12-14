const catchAsync = require("../helpers/catch.async")
const ImageService = require("../services/image.service")
const {CREATED, OK} = require("../core/success.response");

class ImageController {
    getUrl = catchAsync(async (req, res) => {
        // OK(res, "Get Url:"+req.params.name, await ImageService.getUrl({name: req.params.name}))
        await ImageService.getUrl({name: req.params.name,res});
    })
}

module.exports = new ImageController()