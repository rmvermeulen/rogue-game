import {
  anyPass,
  chain,
  compose,
  curry,
  curryN,
  filter,
  flip,
  identity,
  map,
  prop,
  reject,
  times,
  uniqBy,
  unnest,
  whereEq,
} from 'ramda';
import { rng } from './create-rng';
import { ICell } from './grid';

// tslint:disable-next-line: no-any
export const generate = (flip(times) as unknown) as <T = any>(
  n: number,
  fn: (n: number) => T,
) => T[];

export const weightedPick = <T>([item, ...rest]: T[]): T =>
  rest.length === 0 ? item : rng.bool() ? item : weightedPick(rest);

export const natural = compose(
  curryN(2, Math.max)(1),
  Math.floor,
  Math.abs,
);

export const withoutBy = <T>(
  isEqual: (a: T, b: T) => boolean,
  banList: T[],
  list: T[],
): T[] => {
  const isBanned = anyPass(map((a: T) => (b: T) => isEqual(a, b), banList));

  return reject(isBanned, list);
};

type HasId = Readonly<{ id: number }>;

export const withoutById = curry(withoutBy)(
  (a: HasId, b: HasId) => a.id === b.id,
);

export const createCell = (x: number, y: number, id: number) => ({
  x,
  y,
  id,
});
export const gridFactory = <T>(
  width: number,
  height: number,
  // tslint:disable-next-line: no-any
  create: (x: number, y: number, index: number) => T = createCell as any,
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

export const manhattan = (a: Point, b: Point) =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

export const isNeighborOf = (a: Point) => (b: Point): boolean =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;

export const findNeighborsFrom = <T extends Point>(sourceCells: T[]) => (
  currentCell: T,
): T[] => sourceCells.filter(isNeighborOf(currentCell));

export type Candidate = Point & Readonly<Pick<ICell, 'id' | 'roomId'>>;

export const findCandidatesFrom = (sourceCells: Candidate[]) => (
  roomCells: Candidate[],
  excludeCurrent = false,
): Candidate[] => {
  return compose(
    // remove 'roomCells'
    excludeCurrent
      ? (withoutById(roomCells) as (cs: Candidate[]) => Candidate[])
      : identity,
    // find uniq neighbors of 'roomCells'
    uniqBy(prop('id')),
    filter<Candidate>(whereEq({ roomId: -1 } as Partial<Candidate>)),
    chain(findNeighborsFrom(sourceCells)),
  )(roomCells);
};

export const pickInitialRoomCells = (cells: ProtoCell[], roomCount: number) => {
  // pick a starting point for each room at random
  // - no overlap
  // - not locked in
  let pool = cells;
  const roomStartCells: ProtoCell[] = [];
  while (roomStartCells.length < roomCount) {
    const cell = rng.pickone(pool);
    pool = withoutById([cell], pool) as typeof cells;

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
