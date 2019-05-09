import { assert } from 'chai';
import {
  __,
  addIndex,
  assoc,
  chain,
  compose,
  head,
  map,
  merge,
  prop,
  sortBy,
} from 'ramda';
import { ICell, IGridOptions } from './grid';
import { Pool } from './pool';
import {
  Candidate,
  createCell,
  findCandidatesFrom,
  gridFactory,
  manhattan,
  weightedPick,
} from './utils';

const applyRoomIds = addIndex<ICell[], ICell[][], ICell[]>(chain)(
  (cells: ICell[], roomId: number): ICell[] => {
    assert.isArray(cells, 'applyRoomIds');

    return cells.map(merge(__, { roomId }));
  },
);

type Scored<T> = [T, number];
const pickChampion = (input: Array<Scored<Candidate>>): Candidate => {
  if (input.length === 0) {
    return undefined;
  }

  const [champ] = input.reduce(
    (
      candidate: Scored<Candidate>,
      champion: Scored<Candidate>,
    ): Scored<Candidate> => (champion[1] < candidate[1] ? champion : candidate),
  );

  return champ;
};

const scoreCandidateForRoom = (room: ICell[]) => (
  candidate: Candidate,
): Scored<Candidate> => {
  const totalDistance = room.reduce(
    (total, cell) =>
      total +
      (Math.sqrt((candidate.x - cell.y) ** 2) +
        Math.sqrt(candidate.y - cell.y) ** 2),
    0,
  );

  return [candidate, totalDistance];
};

const sortByScore: (
  cs: Array<Scored<Candidate>>,
) => Array<Scored<Candidate>> = sortBy(prop(1));

const preferCloser = (
  currentRoom: ICell[],
  candidates: Candidate[],
): Candidate =>
  // tslint:disable-next-line: no-unsafe-any
  compose(
    head,
    weightedPick,
    sortByScore,
    map(scoreCandidateForRoom(currentRoom)),
  )(candidates);

const pickClosest = (
  currentRoom: ICell[],
  candidates: Candidate[],
): Candidate =>
  compose<Candidate[], Array<Scored<Candidate>>, Candidate>(
    pickChampion,
    map(scoreCandidateForRoom(currentRoom)),
  )(candidates);

// tslint:disable-next-line: no-empty-interface
export interface IGeneratorOptions extends IGridOptions {
  pickMethod?: 'random' | 'closest' | 'prefer closer';
}

export const generateCells = (options: IGeneratorOptions): ICell[] => {
  const cells = gridFactory(
    options.width,
    options.height,
    compose(
      assoc('roomId', -1),
      createCell,
    ),
  );
  const pool = new Pool(cells, options.rng);
  const idOf = prop('id');
  pool.useEq((a, b) => idOf(a) === idOf(b));
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
  let safetyLimit = 10000;
  // for each room

  while (safetyLimit > 0 && pool.size > 0) {
    safetyLimit -= 1;
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

      let picked: Candidate | undefined;
      switch (options.pickMethod) {
        case 'random':
          picked = options.rng.pickone(candidates);
          break;

        case 'closest':
          picked = pickClosest(rooms[i], candidates);
          break;

        default:
        case 'prefer closer':
          picked = preferCloser(rooms[i], candidates);
      }

      if (picked === undefined) {
        continue;
      }

      // remove from pool
      pool.remove([picked]);
      // add cell to list for the current room
      rooms[i].push(picked);
      assignedCells.push(picked);
    }
  }

  assert(safetyLimit, 'Too many loops');

  return compose(
    sortBy(prop('id')),
    applyRoomIds,
  )(rooms);
};
