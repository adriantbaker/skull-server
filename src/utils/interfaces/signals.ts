import { Hand } from '../classes/Deck/CoupDeck';

export interface ChallengeOutcome {
    success: boolean // true if challenger won; false if not
    vindicatedPlayerHand: Hand | undefined // player receives new card if wrongly challenged
    winnerId: string // playerId of challenge winner
    loserId: string // playerId of challenge winner
}
