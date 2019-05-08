#! /usr/bin/env ts-node

import { Chance } from 'chance';
import * as parseArgv from 'minimist';
import { compose, tap, zipObj } from 'ramda';
import { Grid, IGridOptions } from '../src/grid';
import { render } from '../src/grid-renderer';
import { generate } from '../src/utils';

// tslint:disable no-console strict-boolean-expressions

const options = parseArgv(process.argv.slice(2), {
  string: ['m'],
  alias: {
    width: 'w',
    height: 'h',
    roomCount: 'r',
    pickMethod: 'm',
  },
  default: {
    width: '4,16',
    height: '4,16',
    roomCount: '2,15',
    pickMethod: 'prefer closer',
  },
});

const random = new Chance();
const readRangeOrNumber = (value: string | number) => {
  if (typeof value === 'number') {
    return value;
  }

  const naturalOptions = zipObj(['min', 'max'])(
    String(value)
      .split(',')
      .map(Number),
  );

  return random.natural(naturalOptions);
};

// tslint:disable no-unsafe-any
const width = readRangeOrNumber(options.width);
const height = readRangeOrNumber(options.height);
const roomCount = readRangeOrNumber(options.roomCount);
const { pickMethod } = options;
// tslint:enable no-unsafe-any

compose(
  console.log,
  render,
  Grid.CREATE,
  tap(gridOptions => console.log(JSON.stringify(gridOptions, undefined, 2))),
)({ width, height, roomCount });
