import { InputByPlayers } from '../initializers/initializeInputByPlayers';

const isAcceptedByAll = (acceptedBy: InputByPlayers): boolean => (
    Object.values(acceptedBy).every((val) => val === true)
);

export default isAcceptedByAll;
