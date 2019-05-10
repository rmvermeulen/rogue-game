import { add, compose, pluck, propEq, uniq, without } from 'ramda';
import { Grid, IRoom } from './grid';
import { findNeighborsFrom, weightedPick } from './utils';

export interface IRoomInfo extends IRoom {
  neighbors: Array<IRoomInfo['id']>;
  connections: Array<IRoomInfo['id']>;
}

export const connectRooms = (a: IRoomInfo, b: IRoomInfo) => {
  a.connections = uniq([...a.connections, b.id]);
  b.connections = uniq([...b.connections, a.id]);
};

const updateConnections = (grid: Grid) => {
  const rooms: IRoomInfo[] = [];
  for (const id of grid.listRooms()) {
    const info = grid.findRoomById(id);
    rooms.push({
      ...info,
      neighbors: [],
      connections: [],
    });
  }

  const findNeighbors = findNeighborsFrom(grid.cells);
  // connect rooms that are neighbours
  for (const room of rooms) {
    const ids = [];
    for (const cellId of room.cells) {
      const cell = grid.cells[cellId];
      ids.push(
        ...compose(
          pluck('roomId'),
          findNeighbors,
        )(cell),
      );
    }
    room.neighbors.push(...uniq(ids));
  }

  return rooms;
};

export type MapNode = {
  roomId: number;
  children: MapNode[];
};

export const createGraph = (
  grid: Grid,
  rng?: Pick<Chance.Chance, 'pickone' | 'pickset'>,
) => {
  if (rng === undefined) {
    // tslint:disable-next-line: no-parameter-reassignment
    rng = grid.rng;
  }
  const rooms = updateConnections(grid);
  const rootRoom = rng.pickone(rooms);
  const nodeSize = (node: MapNode): number =>
    node.children.map(nodeSize).reduce(add, 0) + 1;

  const cache = [];

  const asTree = (room: IRoomInfo): MapNode => {
    const childCount = weightedPick([3, 2, 1]);
    // console.log('childCount', childCount);
    const candidates = without(cache, room.neighbors);
    if (candidates.length !== 0) {
      const childIds = rng.pickset(candidates, childCount);
      const childRooms = childIds.map(id => rooms.find(propEq('id', id)));
      for (const child of childRooms) {
        connectRooms(room, child);
      }
    }

    // connections to rooms that haven't been mapped yet
    const children = without(cache, room.connections);

    cache.push(...children);

    return {
      roomId: room.id,
      children: children.map(id => asTree(rooms.find(propEq('id', id)))),
    };
  };

  cache.push(rootRoom.id);

  return asTree(rootRoom);
};
