class Player {
    constructor(socketId, name, isOwner = false) {
        this.socketId = socketId;
        this.name = name;
        this.isOwner = isOwner;
        this.id = name + Date.now();
    }

    getPublic() {
        return {
            name: this.name,
            id: this.id,
        }
    }
}

module.exports = Player;