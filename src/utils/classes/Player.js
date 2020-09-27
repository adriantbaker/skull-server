class Player {
    constructor(socketId, name, isOwner = false) {
        this.socketId = socketId;
        this.name = name;
        this.isOwner = isOwner;
        this.id = name + Date.now();
        this.turnNumber = -1;
    }

    getPublic() {
        return {
            name: this.name,
            id: this.id,
        }
    }
}

module.exports = Player;