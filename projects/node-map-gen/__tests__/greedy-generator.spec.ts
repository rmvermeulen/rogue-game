import { compose, contains, filter, pipe, pluck } from 'ramda';

import { generateCells } from '../src/generators/greedy';
import { ICell } from '../src/grid';

const width = 10;
const height = 10;
const roomCount = 10;

describe.skip('greedily generated grid', () => {
  jest.setTimeout(3e3);
  let cells: ICell[];
  beforeAll(() => {
    cells = generateCells({
      width,
      height,
      roomCount,
    });
  });

  it('is probably a grid', () => {
    expect(cells).toBeDefined();
    expect(cells).toHaveLength(width * height);
  });

  it('has the required rooms', () => {
    const uniqueRoomIds = [...new Set(pluck('room', cells))];
    expect(uniqueRoomIds).toHaveLength(roomCount);
  });

  it.todo('does not have rooms split over separate chunks');

  it('does not have isolated cells', () => {
    const isolatedCells = cells.reduce((total, cell) => {
      const isPartOfRoom = compose(
        contains(cell.roomId),
        pluck('roomId'),
        filter(
          ({ x, y }: ICell) =>
            Math.abs(cell.x - x) + Math.abs(cell.y - y) === 1,
        ),
      )(cells);

      return total + (isPartOfRoom ? 0 : 1);
    }, 0);
    expect(isolatedCells).toBe(0);
  });
});
