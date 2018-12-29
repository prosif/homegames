const WebSocket = require('ws');

class Player {
    constructor(ws) {
        this.inputListeners = new Set();
        this.ws = ws;
        this.ws.on('message', this.handlePlayerInput.bind(this));
        this.ws.on('close', this.disconnect.bind(this));
    }

    handlePlayerInput(msg) {
        const data = JSON.parse(msg);
        // only input is x, y clicks for now
        if (!data.x) {
            console.log(data);
            return;
        } 
        
        for (let listener of this.inputListeners) {
            listener.handlePlayerInput(this, data);
        }
    }

    disconnect(msg) {
        // handle cleanup here. will probably need to notify listeners. too many listeners.
    }

    addInputListener(listener) {
        this.inputListeners.add(listener);
    }

    receiveUpdate(update) {
        this.ws.readyState === WebSocket.OPEN && this.ws.send(update);
    }

}

module.exports = Player;
