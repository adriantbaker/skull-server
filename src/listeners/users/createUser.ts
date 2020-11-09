import { Socket } from 'socket.io';
import { users } from '../..';

interface createUserRequest {
    username: string
}

const createUser = (socket: Socket) => (request: createUserRequest): void => {
    const { username } = request;

    const user = users.addUser(username);

    socket.emit('createUserResponse', user);
};

export default createUser;
