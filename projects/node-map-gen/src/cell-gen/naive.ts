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
export const genCellsNaive = ({ width, height, rooms }: INaiveOptions) => {
  assert.equal(width, natural(width), 'width must be an integer > 0');
  assert.equal(height, natural(height), 'height must be a positive integer');
  assert.equal(rooms, natural(rooms), 'rooms must be a positive integer');

  const avgRoomSize = Math.max(0, Math.floor((width * height) / rooms) - 1);
  const roomIds = generate(rooms, n => repeat(n, avgRoomSize));
  let remainder = width * height - rooms * avgRoomSize;
  while (remainder > 0) {
    const id = random.natural({ max: rooms - 1 });
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
      room: -1,
    })),
    tap((cells: ICell[]) => {
      cells.forEach((cell: ICell) => {
        const trySame = random.weighted([true, false], [15, 1]);
        let room: number;
        if (trySame) {
          // has valid room, which still has entries
          const neighbors = cells
            .filter(
              where({
                room: allPass([lte(0), (r: ICell['room']) => pool.includes(r)]),
              }),
            )
            // manhattan distance
            .filter(
              ({ x, y }: typeof cell) =>
                Math.abs(cell.x - x) + Math.abs(cell.y - y) === 1,
            );
          for (const n of neighbors) {
            const popped = popSpecific(n.room);
            if (popped !== undefined) {
              room = popped;
              break;
            }
          }
        }
        if (room === undefined) {
          room = pool.pop();
        }
        // update cell in-place
        cell.room = room;
      });
    }),
  )(range(0, width * height));
};
