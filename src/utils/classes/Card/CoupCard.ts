export enum CardType {
    Ambassador = 'ambassador',
    Assassin = 'assassin',
    Captain = 'captain',
    Contessa = 'contessa',
    Duke = 'duke'
}

class CoupCard {
    id: number
    type: string

    constructor(cardType: CardType, id: number) {
        this.id = id;
        this.type = cardType;
    }
}

export default CoupCard;
