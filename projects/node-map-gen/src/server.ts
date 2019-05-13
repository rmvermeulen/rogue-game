import * as cors from 'cors';
import * as express from 'express';
import { Request, Response } from 'express';
import * as os from 'os';
import { evolve } from 'ramda';
import { createRNG, rng } from './create-rng';
import { Grid } from './grid';
import { renderGrid } from './render-grid';

const app = express();
app.use(cors());

const doTheThing = (req: Request, res: Response) => {
  console.log(req.query);
  const { width, height, roomCount, seed } = evolve({
    width: parseInt,
    height: parseInt,
    roomCount: parseInt,
    seed: parseInt,
  })(req.query);
  console.log({
    width,
    height,
    roomCount,
    seed,
  });

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

  const grid = Grid.CREATE({
    width,
    height,
    roomCount,
    rng: seed === undefined ? rng : createRNG(seed),
  });

  return renderGrid(grid);
};

app.get('/grid', (req, res) => {
  res.send(doTheThing(req, res));
});

app.listen(3000, () => {
  console.log('server on localhost:3000');
});
