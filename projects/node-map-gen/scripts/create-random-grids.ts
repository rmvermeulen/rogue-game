#! /usr/bin/env ts-node
import { Chance } from 'chance';
import { Grid } from '../src/grid';
import { generate } from '../src/utils';

const args = process.argv.slice(2);
// tslint:disable-next-line: strict-boolean-expressions
const count = parseInt(args[0], 10) || 20;

const random = new Chance();

generate(count, () => {
  const input = {
    width: random.natural({ min: 3, max: 16 }),
    height: random.natural({ min: 3, max: 16 }),
    rooms: random.natural({ min: 10, max: 12 }),
  };
  console.log(JSON.stringify(input, undefined, 2));
  console.log(Grid.CREATE(input).display());
});
