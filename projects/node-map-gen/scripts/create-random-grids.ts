#! /usr/bin/env ts-node
import * as Chance from 'chance';
import { Grid } from '../src/grid';
import { generate } from '../src/utils';

const random = new Chance();
generate(20, () => {
  const input = {
    width: random.natural({ min: 3, max: 16 }),
    height: random.natural({ min: 3, max: 16 }),
    rooms: random.natural({ min: 2, max: 9 }),
  };
  console.log(JSON.stringify(input, undefined, 2));
  console.log(Grid.CREATE(input).display());
});
