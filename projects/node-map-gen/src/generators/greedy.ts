import { assert } from 'chai';
import {
  __,
  addIndex,
  assoc,
  chain,
  compose,
  merge,
  prop,
  sortBy,
} from 'ramda';
import { ICell, IGridOptions } from '../grid';
import { Pool } from '../pool';
import { random } from '../random';
import {
  createCell,
  findCandidatesFrom,
  gridFactory,
  manhattan,
} from './utils';

const applyRoomIds = addIndex<ICell[], ICell[][], ICell[]>(chain)(
  (cells: ICell[], roomId: number): ICell[] => {
    assert.isArray(cells, 'applyRoomIds');

    return cells.map(merge(__, { roomId }));
  },
);

// tslint:disable-next-line: no-empty-interface
export interface IGreedyOptions extends IGridOptions {}

export const generateCells = (options: IGreedyOptions): ICell[] => {
  const cells = gridFactory(
    options.width,
    options.height,
    compose(
      assoc('roomId', -1),
      createCell,
    ),
  );
  const pool = new Pool(cells);
  // pick a starting cell for each room
  // must be unique (handled by pool)
  // must not be locked in on 4 sides
  const initialCells = pool.takeN(options.roomCount, (cell, set) => {
    let closedSides = 0;
    for (const other of set) {
      if (manhattan(cell, other) === 1) {
        closedSides += 1;
      }
      if (closedSides >= 4) {
        return false;
      }
    }

    return true;
  });
  assert.lengthOf(
    initialCells,
    options.roomCount,
    'Must have an initial cell for each room',
  );
  const assignedCells = [...initialCells];
  const rooms: ICell[][] = initialCells.map(cell => [cell]);
  // remaining cells are the pool
  let limit = 1000;
  // for each room

  while (limit > 0 && pool.size > 0) {
    limit -= 1;
    for (let i = 0; i < options.roomCount; i += 1) {
      // if pool is empty break;
      if (pool.size === 0) {
        break;
      }
      // find cells adjacent to cell in current room
      // NOTE: maybe use pool.take[N/Many] with constraints
      const candidates = findCandidatesFrom(pool.ref())(rooms[i], true);
      if (candidates.length === 0) {
        continue;
      }
      // NOTE: pick best cell by number of neighbors?
      const picked = random.pickone(candidates);
      // remove from pool
      pool.remove([picked]);
      // add cell to list for the current room
      rooms[i].push(picked);
      assignedCells.push(picked);
    }
  }

  return compose(
    sortBy(prop('id')),
    applyRoomIds,
  )(rooms);
};
