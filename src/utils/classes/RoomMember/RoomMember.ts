class RoomMember {
    id: string
    name: string
    isOwner: boolean

    constructor(id: string, name: string, isOwner = false) {
        this.id = id;
        this.name = name;
        this.isOwner = isOwner;
    }
}

export default RoomMember;
