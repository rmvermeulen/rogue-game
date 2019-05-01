import { assert } from 'chai';
import {
  allPass,
  ascend,
  clone,
  equals,
  filter,
  flatten,
  lte,
  map,
  pipe,
  pluck,
  prop,
  propEq,
  range,
  repeat,
  sortWith,
  tap,
  times,
  uniq,
  where,
} from 'ramda';
import { genCellsNaive } from './cell-gen/naive';
import { random } from './random';
import { generate, natural } from './utils';

export interface IGridOptions extends Partial<Grid> {
  width: number;
  height: number;
  rooms: number;
  cells?: ICell[];
}

export interface ICell {
  id: number;
  x: number;
  y: number;
  room: number;
}

export interface IRoom {
  id: number;
  size: number;
  cells: ICell['id'][];
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
  private readonly rooms: number;
  private cachedRoomList: number[] | undefined;
  private constructor(options: IGridOptions) {
    const { width, height, rooms, cells } = options;
    this.width = width;
    this.height = height;
    this.rooms = rooms;
    const isClone = options instanceof Grid;
    if (isClone) {
      assert.isNotEmpty(cells, 'Invalid Grid.CLONE: incomplete source');
      this.cells = clone(cells);
    } else {
      this.cells = this.generateCells();
    }
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
      this.cachedRoomList = pipe<ICell[], number[], number[], number[]>(
        pluck('room'),
        uniq,
        filter(lte(0)),
      )(this.cells);
    }

    return [...this.cachedRoomList];
  }

  // get information on a specific room
  public findRoomById(id: IRoom['id']): IRoom | undefined {
    const cells = this.cells.filter(propEq('room', id));

    return cells.length > 0
      ? {
          id,
          size: cells.length,
          cells: pluck('id', cells),
        }
      : undefined;
  }

  private generateCells() {
    return genCellsNaive(this);
  }
}
