import { times, objOf, whereEq, propEq, pluck, repeat, trim } from 'ramda';
import * as os from 'os';

const createObjects = times(objOf('id'));

export interface IGridOptions {
  width: number;
  height: number;
  rooms: number;
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

export class Grid {
  public readonly width: number;
  public readonly height: number;

  public readonly cells: ICell[];
  private constructor({ width, height, rooms }: IGridOptions) {
    this.width = width;
    this.height = height;

    this.cells = createObjects(width * height).map(cell =>
      Object.assign(cell, {
        x: cell.id % width,
        y: Math.floor(cell.id / width),
        room: Math.floor(Math.random() * rooms),
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

  findRoomById(id: IRoom['id']): IRoom | undefined {
    const cells = this.cells.filter(propEq('room', id));
    return cells.length
      ? {
          id,
          size: cells.length,
          cells: pluck('id', cells),
        }
      : undefined;
  }

  display(): string {
    let header = `+${repeat('---+', this.width).join('')}`;
    const lines = [header];
    for (let y = 0; y < this.height; ++y) {
      let line = '| ';
      let sep = '';
      for (let x = 0; x < this.width; ++x) {
        const cell = this.cellAt(x, y);
        const east = this.cellAt(x + 1, y);
        const south = this.cellAt(x, y + 1);
        line += `${cell.room} ${east && east.room === cell.room ? '  ' : '| '}`;
        sep += south && south.room === cell.room ? '+   ' : '+---';
      }
      lines.push(line, sep + '+');
    }

    return lines.map(trim).join(os.EOL);
  }
}
