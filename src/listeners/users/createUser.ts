import { Socket } from 'socket.io';
import Users from '../../utils/classes/User/Users';

interface createUserRequest {
    username: string
}

const createUser = (socket: Socket, users: Users) => (request: createUserRequest): void => {
    const { username } = request;

    const user = users.addUser(username);

    socket.emit('createUserResponse', user);
};

export default createUser;
