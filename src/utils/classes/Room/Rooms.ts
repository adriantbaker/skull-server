import Room, { RoomPublic } from './Room';

class Rooms {
    rooms: { [key: string]: Room }

    constructor() {
        this.rooms = {};
    }

    addRoom(room: Room): void {
        this.rooms[room.id] = room;
    }

    removeRoom(roomId: string): Room {
        const room = this.rooms[roomId];
        delete this.rooms[roomId];
        return room;
    }

    /** Getters */

    getOne(roomId: string): Room {
        return this.rooms[roomId];
    }

    getOnePublic(roomId: string): RoomPublic {
        return this.rooms[roomId].getPublic();
    }

    getAll(): Array<Room> {
        return Object.values(this.rooms);
    }

    getAllPublic(): Array<RoomPublic> {
        return Object.values(this.rooms).map((room) => room.getPublic());
    }

    getNumRooms(): number {
        return Object.keys(this.rooms).length;
    }
}

export default Rooms;
