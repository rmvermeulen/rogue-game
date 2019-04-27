import { Grid, IGridOptions } from '../src/grid';
import { times, flip } from 'ramda';

const doN = flip(times);

describe.each([
  {
    width: 5,
    height: 5,
  },
])('grid class', (options: IGridOptions) => {
  const grid = Grid.create(options);

  expect(grid).toBeDefined();

  it('can find rows', () => {
    expect(grid.row(0)).toHaveLength(options.width);
    expect(grid.row(options.height)).toHaveLength(0);
  });

  it('can find columns', () => {
    expect(grid.column(0)).toHaveLength(options.height);
    expect(grid.column(options.width)).toHaveLength(0);
  });

  it('can list the unique room ids', () => {
    expect(grid.listRooms()).toHaveLength(1);
  });

  it('can find cells by position', () => {
    doN(options.width, x =>
      doN(options.height, y =>
        expect(grid.cellAt(x, y)).toMatchObject({ x, y }),
      ),
    );
  });

  it('can be displayed in the cli', () => {
    expect(grid.display()).toMatchSnapshot();
  });
});
