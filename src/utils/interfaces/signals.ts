import { Hand } from '../classes/Deck/CoupDeck';

export interface ChallengeOutcome {
    success: boolean // true if challenger won; false if not
    winnerId: string // playerId of challenge winner
    loserId: string // playerId of challenge winner
}

export interface ActionOutcome {
    targetMustDiscard: boolean,
    drawnPlayerCards: Hand
}
