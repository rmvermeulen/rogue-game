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

generate(count, () =>
  compose(
    console.log,
    render,
    Grid.CREATE,
  )({
    width: random.natural({ min: 3, max: 16 }),
    height: random.natural({ min: 3, max: 16 }),
    roomCount: random.natural({ min: 10, max: 12 }),
  }),
);
