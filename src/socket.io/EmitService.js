const server = require("./config")

const EventName = {
    OnOrderCreated: "onordercreate"

}


class SocketEmitService {
    static EmitNewOrder({order = null, shopId}) {
        server.emit(`${EventName.OnOrderCreated}/${shopId}`, order)
    }
}

module.exports = SocketEmitService

