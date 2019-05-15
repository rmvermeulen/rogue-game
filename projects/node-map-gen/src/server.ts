import * as cors from 'cors';
import * as express from 'express';
import * as os from 'os';
import { evolve } from 'ramda';
import { createRNG, rng } from './create-rng';
import { Grid } from './grid';
import { renderGrid } from './render-grid';

const app = express();
app.use(cors());

type GridOptions<T> = {
  width: T;
  height: T;
  roomCount: T;
  seed: T;
};

const createGridFromQuery = (params: Partial<GridOptions<string>> = {}) => {
  const { width, height, roomCount, seed } = evolve(
    {
      width: parseInt,
      height: parseInt,
      roomCount: parseInt,
      seed: parseInt,
    },
    // tslint:disable-next-line: no-any
    params as any,
  ) as Partial<GridOptions<number>>;

  const errors = [];

  if (isNaN(width)) {
    errors.push(`'width' must be a natural number`);
  }
  if (isNaN(height)) {
    errors.push(`'height' must be a natural number`);
  }
  if (isNaN(roomCount)) {
    errors.push(`'roomCount' must be a natural number`);
  }
  if (errors.length !== 0) {
    throw new Error(errors.join(os.EOL));
  }

  return Grid.CREATE({
    width,
    height,
    roomCount,
    rng: seed === undefined ? rng : createRNG(seed),
  });
};

app.get('/grid', (req, res) => {
  // tslint:disable-next-line: no-unsafe-any
  const grid = createGridFromQuery(req.query);
  res.send(grid.toObject());
});

app.get('/grid/rendered', (req, res) => {
  // tslint:disable-next-line: no-unsafe-any
  const grid = createGridFromQuery(req.query);
  res.send(renderGrid(grid));
});

app.listen(3000, () => {
  // tslint:disable-next-line: no-console
  console.log('server on localhost:3000');
});
