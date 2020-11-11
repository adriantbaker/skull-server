import RoomMember from './RoomMember';

class RoomMembers {
    members: { [key: string]: RoomMember }

    constructor(members: Array<RoomMember> = []) {
        this.members = {};
        members.forEach((member) => {
            this.members[member.id] = member;
        });
    }

    addMember(member: RoomMember): void {
        this.members[member.id] = member;
    }

    removeMember(memberId: string): RoomMember {
        const member = this.members[memberId];
        delete this.members[memberId];
        return member;
    }

    resetReadiness(): void {
        Object.keys(this.members).forEach((memberId) => {
            this.members[memberId].ready = false;
        });
    }

    /** Getters */

    getOne(memberId: string): RoomMember {
        return this.members[memberId];
    }

    getAll(): Array<RoomMember> {
        return Object.values(this.members);
    }

    getAllPublic(): Array<RoomMember> {
        return this.getAll();
    }
}

export default RoomMembers;
