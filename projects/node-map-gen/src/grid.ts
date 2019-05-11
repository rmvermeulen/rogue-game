import { assert } from 'chai';
import {
  ascend,
  clone,
  compose,
  filter,
  lte,
  omit,
  pluck,
  prop,
  propEq,
  sortWith,
  uniq,
} from 'ramda';
import { Omit } from 'utility-types';
import { generateCells } from './generator';
import { generate } from './utils';

export interface IGridOptions extends Partial<Grid> {
  width: number;
  height: number;
  roomCount: number;
  cells?: ICell[];
  rng: Chance.Chance;
}

export interface ICell {
  id: number;
  x: number;
  y: number;
  roomId: number;
}

export interface IRoom {
  id: number;
  size: number;
  cells: Array<ICell['id']>;
}

// represents a grid of cells
export class Grid {
  public static SORT: (cells: ICell[]) => ICell[] = sortWith([
    ascend(prop('y')),
    ascend(prop('x')),
  ]);
  public readonly width: number;
  public readonly height: number;
  public readonly cells: ICell[];
  public readonly roomCount: number;
  public readonly rng: Chance.Chance;
  private cachedRoomList: number[] | undefined;
  private constructor(options: IGridOptions) {
    const { width, height, roomCount, cells, rng } = options;
    assert.isNumber(width, '[Grid] Invalid width');
    assert.isNumber(roomCount, '[Grid] Invalid roomCount');
    assert.isObject(rng, '[Grid] Invalid rng');
    assert.isNumber(height, '[Grid] Invalid height');

    this.width = width;
    this.height = height;
    this.roomCount = roomCount;
    this.rng = rng;

    // are we cloning an existing grid?
    if (options instanceof Grid) {
      assert.lengthOf(
        cells,
        width * height,
        '[Grid] Invalid clone: incomplete source',
      );
      this.cells = clone(cells);
    } else {
      this.cells = generateCells(this);
    }
  }

  public static FROM_CELLS(
    width: number,
    height: number,
    cells: ICell[],
  ): Grid {
    const grid = Object.create(Grid.prototype) as Grid;
    Object.assign(grid, { width, height, cells });

    return grid;
  }

  public static CREATE(options: IGridOptions) {
    return new Grid({ ...options });
  }

  public static CLONE(grid: Grid) {
    // tslint:disable-next-line: no-any
    return new Grid(grid as any);
  }
  public clone() {
    return Grid.CLONE(this);
  }

  public cellAt(x: number, y: number): undefined | ICell {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return undefined;
    }

    return this.cells[x + y * this.width];
  }

  // find all cells belonging to the given row
  public row(y: number): ICell[] {
    if (y < 0 || y >= this.height) {
      return [];
    }
    const rowStart = y * this.width;
    const rowEnd = rowStart + this.width;

    return this.cells.slice(rowStart, rowEnd);
  }

  // find all cells belonging to the given column
  public column(x: number): ICell[] {
    if (x < 0 || x >= this.width) {
      return [];
    }

    return generate(this.height, y => this.cellAt(x, y));
  }

  // list the unique room-ids in the grid
  public listRooms(): number[] {
    if (this.cachedRoomList === undefined) {
      this.cachedRoomList = compose<ICell[], number[], number[], number[]>(
        uniq,
        filter(lte(0)),
        pluck('roomId'),
      )(this.cells);
    }

    return [...this.cachedRoomList];
  }

  // get information on a specific room
  public findRoomById(id: IRoom['id']): IRoom | undefined {
    const cells = this.cells.filter(propEq('roomId', id));

    return cells.length > 0
      ? {
          id,
          size: cells.length,
          cells: pluck('id', cells),
        }
      : undefined;
  }

  public toObject(): Omit<Grid, 'rng'> {
    return omit(['rng'], this);
  }
}
