import randtoken from 'rand-token';

const generateId = (): string => randtoken.generate(16);

export default generateId;
