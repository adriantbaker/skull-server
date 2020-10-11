import { Action } from '../initializers/initializeAction';

const canImplementAction = (action: Action): boolean => {
    const {
        canChallenge,
        canBlock,
    } = action;

    return !canChallenge && !canBlock;
};

export default canImplementAction;
