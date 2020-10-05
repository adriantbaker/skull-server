import { ActionType } from '../../../../../listeners/coupGame/tryAction';
import { BlockActionType } from '../../../../../listeners/coupGame/tryBlock';

const initializeCanChallenge = (actionType: ActionType | BlockActionType): boolean => {
    switch (actionType) {
        case ActionType.Income:
        case ActionType.ForeignAid:
        case ActionType.Coup:
            return false;
        default:
            return true;
    }
};

export default initializeCanChallenge;
