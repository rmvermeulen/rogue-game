// tslint:disable no-implicit-dependencies

import 'jest-extended';
import { stringify } from 'yaml';
import { Grid } from '@src/grid';
import { createGraph, MapNode } from '@src/map-graph';
import { createRNG } from '@src/random';

describe.each([
  [5, 5, 4],
  [10, 5, 4],
  [5, 10, 4],
  [10, 10, 4],
  [5, 5, 16],
  [10, 5, 16],
  [5, 10, 16],
  [10, 10, 16],
])('Map graph %i %i %i', (width, height, roomCount) => {
  let graph: MapNode;
  beforeAll(() => {
    const grid = Grid.CREATE({
      width,
      height,
      roomCount,
      rng: createRNG(12345),
    });
    graph = createGraph(grid);
  });

  it('is a graph', () => {
    const checkObject = (obj: {}): boolean =>
      // tslint:disable-next-line: strict-boolean-expressions
      !expect(obj).toMatchObject({
        roomId: expect.toBeNumber(),
        children: expect.toSatisfyAll(checkObject),
      });

    expect(graph).toSatisfy(checkObject);

    expect(stringify(graph)).toMatchSnapshot();
  });
});
