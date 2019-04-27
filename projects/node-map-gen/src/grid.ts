import { times, objOf, whereEq } from 'ramda';

const createObjects = times(objOf('id'));

export interface IGridOptions {
  width: number;
  height: number;
}

export interface ICell {
  id: number;
  x: number;
  y: number;
  room: number;
}

export class Grid {
  public readonly width;
  public readonly height;
  public readonly cells: ICell[];
  private constructor({ width, height }: IGridOptions) {
    this.width = width;
    this.height = height;

    this.cells = createObjects(width * height).map(cell =>
      Object.assign(cell, {
        x: cell.id % width,
        y: Math.floor(cell.id / width),
        room: 0,
      }),
    );
  }
  static create(options: IGridOptions) {
    return new Grid(options);
  }

  cellAt(x: number, y: number): ICell | undefined {
    return this.cells.find(whereEq({ x, y }));
  }

  row(y: number): ICell[] {
    return this.cells.filter(whereEq({ y }));
  }

  column(x: number): ICell[] {
    return this.cells.filter(whereEq({ x }));
  }

  listRooms(): number[] {
    return Array.from(
      this.cells.reduce((ids, cell) => {
        ids.add(cell.room);
        return ids;
      }, new Set<number>()),
    );
  }

  display(): string {
    return '';
  }
}
