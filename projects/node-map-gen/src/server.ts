import * as express from 'express';
import * as os from 'os';
import { evolve } from 'ramda';
import { Grid } from './grid';
import { createRNG, random } from './random';
import { renderGrid } from './render-grid';

const app = express();

app.get('/grid', (req, res) => {
  const { width, height, roomCount, seed } = evolve({
    width: parseInt,
    height: parseInt,
    roomCount: parseInt,
    seed: parseInt,
  })(req.query);

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

  const rng = seed === undefined ? random : createRNG(seed);

  const grid = Grid.CREATE({
    width,
    height,
    roomCount,
    rng,
  });

  // tslint:disable strict-boolean-expressions
  res.write(
    `
    <!DOCTYPE html>
    <html>
      <style>
        .r0 { color: red }
        .r1 { color: green }
        .r2 { color: blue }
        .r3 { color: yellow }
        .r4 { color: magenta }
        .r5 { color: cyan }
      </style>
      <form>
      <label for="width" />
        <input type="number" name="width" value="${width || 5}">
        <label for="height" />
        <input type="number" name="height" value="${height || 5}">
        <label for="roomCount" />
        <input type="number" name="roomCount" value="${roomCount || 5}">
        <label for="seed" />
        <input type="number" name="seed" value="${seed || 12345}">
        <br />
        <button type="submit">send</button>
      </form>
      <pre class="r0">
        ${renderGrid(grid)}
      </pre>
      <pre>
        ${JSON.stringify(grid, undefined, 2)}
      </pre>
      <script>console.log(${width},${height},${roomCount},${seed})</script>
    </html>
    `,
  );

  res.end();
});

app.listen(3000, () => {
  console.log('server on localhost:3000');
});
