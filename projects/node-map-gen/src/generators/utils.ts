import {
  anyPass,
  compose,
  CurriedFunction2,
  curry,
  filter,
  identity,
  map,
  prop,
  reject,
  uniqBy,
  unnest,
  whereEq,
} from 'ramda';
import { ICell } from '../grid';
import { random } from '../random';
import { generate } from '../utils';

export const withoutBy = curry(
  <T>(isEqual: (a: T, b: T) => boolean, banList: T[], list: T[]): T[] => {
    const isBanned = anyPass(map((a: T) => (b: T) => isEqual(a, b), banList));

    return reject(isBanned, list);
  },
);

type HasId = Readonly<{ id: number }>;

export const withoutById = withoutBy((a: HasId, b: HasId) => a.id === b.id);

export const gridFactory = <T>(
  width: number,
  height: number,
  create: (x: number, y: number, index: number) => T,
): T[] => {
  let index = 0;

  return unnest(
    generate(height, y =>
      generate(width, x => {
        const cell = create(x, y, index);
        index += 1;

        return cell;
      }),
    ),
  );
};

export type ProtoCell = Readonly<ICell & { neighborCount: number }>;

export type Point = Readonly<{ x: number; y: number }>;

export const isNeighborOf = (a: Point) => (b: Point): boolean =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;

export const findNeighborsFrom = <T extends Point>(sourceCells: T[]) => (
  currentCell: T,
): T[] => sourceCells.filter(isNeighborOf(currentCell));

export type Candidate = Point & Readonly<Record<'id' | 'room', number>>;

export const findCandidatesFrom = (sourceCells: Candidate[]) => (
  currentCells: Candidate[],
  excludeCurrent = false,
): Candidate[] => {
  return compose(
    excludeCurrent
      ? (withoutById(currentCells) as (cs: Candidate[]) => Candidate[])
      : identity,
    uniqBy(prop('id')),
    filter<Candidate>(whereEq({ room: -1 })),
    unnest,
    // chain(findNeighborsFrom(sourceCells)),
    map(findNeighborsFrom(sourceCells)),
  )(currentCells);
};

export const pickInitialRoomCells = (cells: ProtoCell[], roomCount: number) => {
  // pick a starting point for each room at random
  // - no overlap
  // - not locked in
  let pool = cells;
  const roomStartCells: ProtoCell[] = [];
  while (roomStartCells.length < roomCount) {
    const cell = random.pickone(pool);
    pool = withoutById([cell], pool);

    // cells outside the grid don't matter
    const neighborhood = cells.filter(isNeighborOf(cell));

    const pickedNeighbors = neighborhood.reduce(
      (total, neighbor) => total + (roomStartCells.includes(neighbor) ? 1 : 0),
      0,
    );

    if (neighborhood.length === pickedNeighbors) {
      // cell is locked in, all it's neighbors
      // are a starting point, or missing (outside grid)
      continue;
    }

    const roomId = roomStartCells.length;
    roomStartCells.push({
      ...cell,
      roomId: roomId,
    });
  }

  return roomStartCells;
};

