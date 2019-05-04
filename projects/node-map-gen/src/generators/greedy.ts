import { ICell, IGridOptions } from '../grid';

// tslint:disable-next-line: no-empty-interface
export interface IGreedyOptions extends IGridOptions {}

export const generateCells = (options: IGreedyOptions): ICell[] => {
  // pick a starting cell for each room
  // must be unique
  // must not be locked in on 4 sides
  // remaining cells are the pool
  // for each room
  // if pool is empty break;
  // find cells adjacent to cell in current room
  // pick best cell, shrink pool
  // add cell to list for the current room
  return [];
};
