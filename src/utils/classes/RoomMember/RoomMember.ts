class RoomMember {
    id: string
    name: string
    isOwner: boolean
    ready: boolean
    numWins: number

    constructor(id: string, name: string, isOwner = false) {
        this.id = id;
        this.name = name;
        this.isOwner = isOwner;
        this.ready = false;
        this.numWins = 0;
    }

    toggleReady(): void {
        this.ready = !this.ready;
    }
}

export default RoomMember;
