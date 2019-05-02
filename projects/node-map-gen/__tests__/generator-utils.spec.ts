jest.doMock('../src/random');

// tslint:disable-next-line: no-implicit-dependencies no-import-side-effect
import 'jest-extended';
import { equals, objOf, range } from 'ramda';
import {
  findCandidatesFrom,
  findNeighborsFrom,
  gridFactory,
  isNeighborOf,
  pickInitialRoomCells,
  withoutBy,
  withoutById,
} from '../src/generators/utils';
import { generate } from '../src/utils';

describe('generator utils', () => {
  test('withoutBy', () => {
    const list = range(10);
    const banned = [1, 4, 8];
    const result = withoutBy(equals, banned, list);
    expect(result).not.toContain(banned);
  });
  test('withoutById', () => {
    const list = generate(10, objOf('id'));
    const banned = [1, 4, 8].map(objOf('id'));
    const result = withoutById(banned, list);
    expect(result).not.toContain(banned);
  });
  test('gridFactory', () => {
    const width = 5;
    const height = 5;
    const cells = gridFactory(width, height, (x, y, id) => ({
      x,
      y,
      id,
    }));
    expect(cells).toBeDefined();
    expect(cells).toHaveLength(width * height);
  });

  test('isNeighborOf', () => {
    const cell = { x: 1, y: 1 };
    const isNeighbor = isNeighborOf(cell);
    expect(
      [
        [0, 0],
        [0, 1],
        [0, 2],
        [1, 0],
        [1, 2],
        [2, 0],
        [2, 1],
        [2, 2],
        [3, 0],
        [3, 1],
        [3, 2],
        [0, 3],
        [1, 3],
        [2, 3],
        [1, 1],
        [1, 2.5],
      ].map(([x, y]) => `x=${x} y=${y} -> ${isNeighbor({ x, y })}`),
    ).toMatchInlineSnapshot(`
                              Array [
                                "x=0 y=0 -> false",
                                "x=0 y=1 -> true",
                                "x=0 y=2 -> false",
                                "x=1 y=0 -> true",
                                "x=1 y=2 -> true",
                                "x=2 y=0 -> false",
                                "x=2 y=1 -> true",
                                "x=2 y=2 -> false",
                                "x=3 y=0 -> false",
                                "x=3 y=1 -> false",
                                "x=3 y=2 -> false",
                                "x=0 y=3 -> false",
                                "x=1 y=3 -> false",
                                "x=2 y=3 -> false",
                                "x=1 y=1 -> false",
                                "x=1 y=2.5 -> false",
                              ]
                    `);
  });

  test('findNeighborsFrom', () => {
    const source = gridFactory(3, 3, (x, y) => ({ x, y }));
    const findNeighbors = findNeighborsFrom(source);
    expect(findNeighbors({ x: 1, y: 1 })).toMatchInlineSnapshot(`
                        Array [
                          Object {
                            "x": 1,
                            "y": 0,
                          },
                          Object {
                            "x": 0,
                            "y": 1,
                          },
                          Object {
                            "x": 2,
                            "y": 1,
                          },
                          Object {
                            "x": 1,
                            "y": 2,
                          },
                        ]
                `);
  });

  test('pickInitialRoomCells', () => {
    const cells = gridFactory(3, 3, (x, y, id) => ({
      id,
      roomId: -1,
      x,
      y,
      neighborCount: 0,
    }));
    const initialCells = pickInitialRoomCells(cells, 3);
    expect(initialCells).toMatchInlineSnapshot(`
      Array [
        Object {
          "id": 8,
          "neighborCount": 0,
          "roomId": 0,
          "x": 2,
          "y": 2,
        },
        Object {
          "id": 8,
          "neighborCount": 0,
          "roomId": 1,
          "x": 2,
          "y": 2,
        },
        Object {
          "id": 2,
          "neighborCount": 0,
          "roomId": 2,
          "x": 2,
          "y": 0,
        },
      ]
    `);
  });

  test('findCandidatesFrom', () => {
    const source = gridFactory(2, 2, (x, y, id) => ({ id, x, y, room: -1 }));
    const findCandidates = findCandidatesFrom(source);
    const candidates = findCandidates([{ id: -1, room: -1, x: 0, y: 0 }]);
    expect(candidates).toMatchInlineSnapshot(`
                  Array [
                    Object {
                      "id": 1,
                      "room": -1,
                      "x": 1,
                      "y": 0,
                    },
                    Object {
                      "id": 2,
                      "room": -1,
                      "x": 0,
                      "y": 1,
                    },
                  ]
            `);
  });
});
