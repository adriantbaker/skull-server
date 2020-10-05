import { Action } from '../initializers/initializeAction';

const handleExpireAction = (action: Action): Action => ({
    ...action,
    canChallenge: false,
    canBlock: false,
});

export default handleExpireAction;
