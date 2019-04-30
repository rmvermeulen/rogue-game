#! /usr/bin/env ts-node
import { Chance } from 'chance';
import { compose } from 'ramda';
import { Grid } from '../src/grid';
import { render } from '../src/grid-renderer';
import { generate } from '../src/utils';

// tslint:disable no-console strict-boolean-expressions

const args = process.argv.slice(2);
const count = parseInt(args[0], 10) || 1;
const random = new Chance();

generate(count, () => {
  const input = {
    width: random.natural({ min: 3, max: 16 }),
    height: random.natural({ min: 3, max: 16 }),
    rooms: random.natural({ min: 10, max: 12 }),
  };
  console.log(JSON.stringify(input, undefined, 2));
  compose(
    console.log,
    render,
    Grid.CREATE,
  )(input);
});
