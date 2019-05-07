import { compose, contains, filter, pluck, uniq } from 'ramda';
import { generateCells } from '../src/generators/greedy';
import { Grid, ICell } from '../src/grid';
import { render } from '../src/grid-renderer';

describe.each`
  width | height | roomCount
  ${10} | ${10}  | ${4}
  ${10} | ${10}  | ${10}
  ${10} | ${10}  | ${35}
  ${20} | ${20}  | ${40}
`(
  'greedily generated grid $width $height $roomCount',
  ({ width, height, roomCount }: { [key: string]: number }) => {
    jest.setTimeout(3e3);
    let cells: ICell[];
    let display: string;
    beforeAll(() => {
      cells = generateCells({
        width,
        height,
        roomCount,
      });
      const grid = Grid.FROM_CELLS(width, height, cells);
      display = render(grid, true);
    });

    test('is probably a grid', () => {
      expect(cells).toBeDefined();
      expect(cells).toHaveLength(width * height);
    });

    test('has the required rooms', () => {
      const uniqueRoomIds = compose<ICell[], number[], number[]>(
        uniq,
        pluck('roomId'),
      )(cells);
      expect(uniqueRoomIds).toHaveLength(roomCount);
    });

    it.todo('does not have rooms split over separate chunks');

    test('does not have unnecessary isolated cells', () => {
      console.log(display);
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
      const expectedIsolatedCells = display.split('size=1 ').length - 1;
      expect(isolatedCells).toBe(expectedIsolatedCells);
    });
  },
);
