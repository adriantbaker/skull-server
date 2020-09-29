export interface PlayerPublic {
    name: string,
    id: string
}

class Player {
    id: string
    socketId: string
    name: string
    isOwner: boolean
    turnNumber: number

    constructor(socketId: string, name: string, isOwner = false) {
        this.socketId = socketId;
        this.name = name;
        this.isOwner = isOwner;
        this.id = name + Date.now();
        this.turnNumber = -1;
    }

    getPublic(): PlayerPublic {
        return {
            name: this.name,
            id: this.id,
        };
    }
}

export default Player;
