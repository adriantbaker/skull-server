import { ActionType } from '../tryAction';
import { BlockActionType } from '../tryBlock';

/**
 *
 * @param actionType of the accepted action
 *
 * @description whether an action of this type will require the target to discard when it succeeds
 */
const targetActionNeeded = (actionType: ActionType | BlockActionType): boolean => {
    switch (actionType) {
        case ActionType.Assassinate:
        case ActionType.Coup:
            return true;
        default:
            return false;
    }
};

export default targetActionNeeded;
