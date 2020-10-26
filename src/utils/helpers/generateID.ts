import randtoken from 'rand-token';
import badCharCombos from '../consts/badCharCombos';

const tokenGenerator = randtoken.generator({
    chars: 'A-Z',
});

const makeToken = () => tokenGenerator.generate(4);

const isBad = (token: string) => {
    if (token.length !== 4) {
        return true;
    }

    for (let i = 0; i < token.length - 1; i++) {
        if (badCharCombos.includes(token.slice(i, i + 2))) {
            return true;
        }
    }

    return false;
};

const generateID = (): string => {
    let token = '';
    while (isBad(token)) {
        token = makeToken();
    }
    return token;
};

export default generateID;
