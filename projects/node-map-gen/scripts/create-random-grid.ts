#! /usr/bin/env ts-node

import * as parseArgv from 'minimist';
import { createRNG } from '../src/create-rng';
import { Grid, IGridOptions } from '../src/grid';
import { renderGrid } from '../src/render-grid';
import { generate } from '../src/utils';
import { assoc, compose, partialRight, tap, zipObj } from 'ramda';
import { stringify } from 'yaml';

// tslint:disable no-console strict-boolean-expressions

const options = parseArgv(process.argv.slice(2), {
  string: ['m'],
  alias: {
    width: 'w',
    height: 'h',
    roomCount: 'r',
    pickMethod: 'm',
    seed: 's',
  },
  default: {
    width: '4,16',
    height: '4,16',
    roomCount: '2,15',
    pickMethod: 'prefer closer',
    seed: 12345,
  },
});

const seed = parseInt(options.seed, 10);
const rng = createRNG(seed);

const readRangeOrNumber = (value: string | number) => {
  if (typeof value === 'number') {
    return value;
  }

  const naturalOptions = zipObj(['min', 'max'])(
    String(value)
      .split(',')
      .map(Number),
  );

  return rng.natural(naturalOptions);
};

// tslint:disable no-unsafe-any
const width = readRangeOrNumber(options.width);
const height = readRangeOrNumber(options.height);
const roomCount = readRangeOrNumber(options.roomCount);
const { pickMethod } = options;
// tslint:enable no-unsafe-any

const display = compose(
  partialRight(renderGrid, [
    {
      useANSIColors: true,
      mapOnly: true,
    },
  ]),
  Grid.CREATE,
  assoc('rng', rng),
  tap(
    compose(
      console.log,
      stringify,
    ),
  ),
)({
  width,
  height,
  roomCount,
  pickMethod,
  rng,
});

console.log(display);
