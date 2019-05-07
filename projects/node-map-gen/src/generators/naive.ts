import { assert } from 'chai';
import { allPass, equals, flatten, flip, gte, repeat, where } from 'ramda';
import { contained } from 'ramda-adjunct';
import { IGridOptions } from '../grid';
import { random } from '../random';
import { generate, natural } from '../utils';
import { manhattan } from './utils';

// tslint:disable-next-line: no-empty-interface
export interface INaiveOptions extends IGridOptions {}

/**
 * generate a grid of cells divided into rooms
 * using a naive algorithm.
 * rooms can be spread into separate chunks as small as 1x1
 */
export const generateCells = ({ width, height, roomCount }: INaiveOptions) => {
  assert.equal(width, natural(width), 'width must be an integer > 0');
  assert.equal(height, natural(height), 'height must be a positive integer');
  assert.equal(
    roomCount,
    natural(roomCount),
    'rooms must be a positive integer',
  );
  assert.isAtMost(roomCount, width * height, 'Too many rooms');

  const avgRoomSize = Math.max(0, Math.floor((width * height) / roomCount) - 1);
  const roomIds = generate(roomCount, n => repeat(n, avgRoomSize));
  let remainder = width * height - roomCount * avgRoomSize;
  while (remainder > 0) {
    const id = random.natural({ max: roomCount - 1 });
    roomIds[id].push(id);
    remainder -= 1;
  }

  const roomIdPool: number[] = random.shuffle(flatten(roomIds));

  const popSpecific = (n: number): number | undefined => {
    const i = roomIdPool.findIndex(equals(n));
    if (i === -1) {
      return undefined;
    }
    const [popped] = roomIdPool.splice(i, 1);

    return popped;
  };

  const cells = generate(width * height, (id: number) => ({
    id,
    x: id % width,
    y: Math.floor(id / width),
    roomId: -1,
  }));

  for (const cell of cells) {
    type CellData = typeof cell;
    // cells with valid room property
    // which is still included in pool
    const roomId = cells
      .filter(
        where({
          room: allPass([flip(gte)(0), contained(roomIdPool)]),
        }),
      )
      // manhattan distance
      .filter((other: CellData) => manhattan(cell, other) === 1)
      .reduce(
        (id: number | undefined, neighbor: CellData) =>
          id === undefined ? popSpecific(neighbor.roomId) : id,
        undefined,
      );

    // update cell in-place
    cell.roomId = roomId !== undefined ? roomId : roomIdPool.pop();
  }

  return cells;
};
