import generateId from '../../helpers/generateId';

interface User {
    id: string
    username: string
}

class Users {
    users: { [key: string]: User}

    constructor() {
        this.users = {};
    }

    addUser(username: string): User {
        let userId = generateId();
        while (this.users[userId]) {
            userId = generateId();
        }

        const user = {
            id: userId,
            username,
        };

        this.users[userId] = user;

        return user;
    }

    getOne(userId: string): User {
        return this.users[userId];
    }
}

export default Users;
