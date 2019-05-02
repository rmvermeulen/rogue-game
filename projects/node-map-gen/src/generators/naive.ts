import { assert } from 'chai';
import {
  allPass,
  equals,
  flatten,
  lte,
  map,
  pipe,
  range,
  repeat,
  tap,
  where,
} from 'ramda';
import { ICell, IGridOptions } from '../grid';
import { random } from '../random';
import { generate, natural } from '../utils';

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

  const pool: number[] = random.shuffle(flatten(roomIds));

  const popSpecific = (n: number): number | undefined => {
    const i = pool.findIndex(equals(n));
    if (i === -1) {
      return undefined;
    }
    const [popped] = pool.splice(i, 1);

    return popped;
  };

  return pipe(
    map((id: number) => ({
      id,
      x: id % width,
      y: Math.floor(id / width),
      roomId: -1,
    })),
    tap((cells: ICell[]) => {
      cells.forEach((cell: ICell) => {
        const trySame = random.weighted([true, false], [15, 1]);
        let roomId: number;
        if (trySame) {
          // has valid room, which still has entries
          const neighbors = cells
            .filter(
              where({
                room: allPass([
                  lte(0),
                  (r: ICell['roomId']) => pool.includes(r),
                ]),
              }),
            )
            // manhattan distance
            .filter(
              ({ x, y }: typeof cell) =>
                Math.abs(cell.x - x) + Math.abs(cell.y - y) === 1,
            );
          for (const n of neighbors) {
            const popped = popSpecific(n.roomId);
            if (popped !== undefined) {
              roomId = popped;
              break;
            }
          }
        }
        if (roomId === undefined) {
          roomId = pool.pop();
        }
        // update cell in-place
        cell.roomId = roomId;
      });
    }),
  )(range(0, width * height));
};
