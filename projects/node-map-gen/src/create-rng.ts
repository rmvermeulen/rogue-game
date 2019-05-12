import * as Chance from 'chance';

export const createRNG = (seed?: number) => new Chance(seed);

export const rng = createRNG();
