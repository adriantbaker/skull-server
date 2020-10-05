import { AcceptedBy } from '../initializers/initializeAcceptedBy';

const isAcceptedByAll = (acceptedBy: AcceptedBy): boolean => (
    Object.values(acceptedBy).every((val) => val === true)
);

export default isAcceptedByAll;
