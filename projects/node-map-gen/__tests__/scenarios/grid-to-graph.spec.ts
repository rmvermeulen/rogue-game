import { Grid } from '@src/grid';
import { createGraph, MapNode } from '@src/map-graph';
import { createRNG } from '@src/random';
import { renderGraph } from '@src/render-graph';
import { renderGrid } from '@src/render-grid';

describe('grid to graph', () => {
  let grid: Grid;
  test('create a grid', () => {
    grid = Grid.CREATE({
      width: 10,
      height: 30,
      roomCount: 50,
      rng: createRNG(12345),
    });
    expect(grid).toBeDefined();
    expect(renderGrid(grid)).toMatchInlineSnapshot(`
      "+---------+----+--------------+-------------------+
      |  5    5 | 24 | 39   39   39 | 23   23   23   23 |
      |         |    |              |         +---------+
      |  5    5 | 24 | 39   39   39 | 23   23 | 26   26 |
      |         |    +----+----+    +---------+----+    |
      |  5    5 | 24   24 | 19 | 39 |  3    3    3 | 26 |
      +---------+----+----+    |    +----+         |    |
      | 49   49   49 | 19   19 | 39   39 |  3    3 | 26 |
      |         +----+         +---------+----+    |    |
      | 49   49 | 19   19   19   19   19   19 |  3 | 26 |
      +----+    +------------------------+----+    |    |
      |  6 | 49 |  4    4    4    4    4 |  3    3 | 26 |
      |    +----+---------+              |         |    |
      |  6    6 | 46   46 |  4    4    4 |  3    3 | 26 |
      |         +----+    +---------+    +---------+    |
      |  6    6    6 | 46 |  2    2 |  4 | 44   44 | 26 |
      +----+----+----+    |         +----+----+    +----+
      | 25 | 28 | 46   46 |  2    2    2    2 | 44   44 |
      |    |    +---------+    +--------------+         |
      | 25 | 28 | 45   45 |  2 | 17   17   17 | 44   44 |
      +----+    |    +----+    |         +----+----+    |
      | 48 | 28 | 45 |  2    2 | 17   17 | 27   27 | 44 |
      |    |    |    +---------+    +----+         |    |
      | 48 | 28 | 45   45   45 | 17 | 27   27   27 | 44 |
      |    +----+----+    +----+    +----+----+    |    |
      | 48 | 13   13 | 45 |  9 | 17 |  8 | 35 | 27 | 44 |
      |    |         +----+    +----+    |    +----+----+
      | 48 | 13   13   13 |  9 |  8    8 | 35   35 | 31 |
      |    |         +----+    |    +----+         |    |
      | 48 | 13   13 |  9    9 |  8 | 35   35   35 | 31 |
      |    +---------+         |    +---------+----+    |
      | 48 |  9    9    9    9 |  8 | 40   40 | 31   31 |
      |    +---------+---------+    |         |    +----+
      | 48 | 10   10 | 47   47 |  8 | 40   40 | 31 | 38 |
      +----+         |         |    +----+----+    |    |
      | 10   10   10 | 47   47 |  8 | 14 | 30 | 31 | 38 |
      |              |    +----+----+    |    +----+    |
      | 10   10   10 | 47 | 18 | 42 | 14 | 30 | 41 | 38 |
      +----+---------+----+    |    |    |    |    |    |
      | 37 | 18   18   18   18 | 42 | 14 | 30 | 41 | 38 |
      |    +----+----+         |    |    +----+    +----+
      | 37   37 | 16 | 18   18 | 42 | 14 | 32 | 41 | 20 |
      |    +----+    +----+----+    |    |    +----+    |
      | 37 | 16   16   16 | 42   42 | 14 | 32 | 29 | 20 |
      |    +----+         +----+----+----+    |    |    |
      | 37   37 | 16   16   16 | 32   32   32 | 29 | 20 |
      +---------+--------------+--------------+----+----+
      | 34   34 |  7    7    7 | 43   43   43   43   43 |
      |         |              +---------+--------------+
      | 34   34 |  7    7    7 |  1    1 | 21   21   21 |
      |         +--------------+----+    +---------+    |
      | 34   34 | 36   36   36   36 |  1 | 22   22 | 21 |
      |         +---------+    +----+    |    +----+----+
      | 34   34 | 15   15 | 36 |  1    1 | 22 |  0    0 |
      +---------+         +----+---------+----+         |
      | 15   15   15   15   15 | 11   11 | 12 |  0    0 |
      +--------------+    +----+         |    |         |
      | 33   33   33 | 15 | 11   11   11 | 12 |  0    0 |
      |              +----+              |    +---------+
      | 33   33   33   33 | 11   11   11 | 12   12   12 |
      +-------------------+--------------+--------------+

      room 0 size=6 cells=268,269,278,279,288,289
      room 1 size=5 cells=245,246,256,265,266
      room 2 size=9 cells=74,75,84,85,86,87,94,103,104
      room 3 size=10 cells=26,27,28,37,38,48,57,58,67,68
      room 4 size=9 cells=52,53,54,55,56,64,65,66,76
      room 5 size=6 cells=0,1,10,11,20,21
      room 6 size=6 cells=50,60,61,70,71,72
      room 7 size=6 cells=232,233,234,242,243,244
      room 8 size=7 cells=126,135,136,145,155,165,175
      room 9 size=8 cells=124,134,143,144,151,152,153,154
      room 10 size=8 cells=161,162,170,171,172,180,181,182
      room 11 size=8 cells=275,276,284,285,286,294,295,296
      room 12 size=5 cells=277,287,297,298,299
      room 13 size=7 cells=121,122,131,132,133,141,142
      room 14 size=5 cells=176,186,196,206,216
      room 15 size=8 cells=262,263,270,271,272,273,274,283
      room 16 size=7 cells=202,211,212,213,222,223,224
      room 17 size=7 cells=95,96,97,105,106,115,125
      room 18 size=7 cells=184,191,192,193,194,203,204
      room 19 size=9 cells=24,33,34,42,43,44,45,46,47
      room 20 size=3 cells=209,219,229
      room 21 size=4 cells=247,248,249,259
      room 22 size=3 cells=257,258,267
      room 23 size=6 cells=6,7,8,9,16,17
      room 24 size=4 cells=2,12,22,23
      room 25 size=2 cells=80,90
      room 26 size=8 cells=18,19,29,39,49,59,69,79
      room 27 size=6 cells=107,108,116,117,118,128
      room 28 size=4 cells=81,91,101,111
      room 29 size=2 cells=218,228
      room 30 size=3 cells=177,187,197
      room 31 size=6 cells=139,149,158,159,168,178
      room 32 size=5 cells=207,217,225,226,227
      room 33 size=7 cells=280,281,282,290,291,292,293
      room 34 size=8 cells=230,231,240,241,250,251,260,261
      room 35 size=6 cells=127,137,138,146,147,148
      room 36 size=5 cells=252,253,254,255,264
      room 37 size=6 cells=190,200,201,210,220,221
      room 38 size=4 cells=169,179,189,199
      room 39 size=9 cells=3,4,5,13,14,15,25,35,36
      room 40 size=4 cells=156,157,166,167
      room 41 size=3 cells=188,198,208
      room 42 size=5 cells=185,195,205,214,215
      room 43 size=5 cells=235,236,237,238,239
      room 44 size=9 cells=77,78,88,89,98,99,109,119,129
      room 45 size=7 cells=92,93,102,112,113,114,123
      room 46 size=5 cells=62,63,73,82,83
      room 47 size=5 cells=163,164,173,174,183
      room 48 size=7 cells=100,110,120,130,140,150,160
      room 49 size=6 cells=30,31,32,40,41,51"
    `);
  });

  let graph: MapNode;
  test('create a graph', () => {
    graph = createGraph(grid);
    expect(graph).toBeDefined();
    expect(renderGraph(graph)).toMatchInlineSnapshot(`
      "<root> node 22
        (22) ->  node 12
          (12) ->  node 11
            (11) ->  node 15
              (15) ->  node 36
                (36) ->  node 7
                  (7) ->  node 43
                    (43) ->  node 20
                      (20) ->  node 41
                        (41) ->  node 31
                          (31) ->  node 38

                          (31) ->  node 40
                            (40) ->  node 14
                              (14) ->  node 32

                              (14) ->  node 42
                                (42) ->  node 18
                                  (18) ->  node 10
                                    (10) ->  node 48
                                      (48) ->  node 13
                                        (13) ->  node 45
                                          (45) ->  node 2
                                            (2) ->  node 44
                                              (44) ->  node 4
                                                (4) ->  node 3
                                                  (3) ->  node 39
                                                    (39) ->  node 24
                                                      (24) ->  node 5

                                                  (3) ->  node 23

                                                (4) ->  node 19

                                                (4) ->  node 49
                                                  (49) ->  node 6

                                              (44) ->  node 26

                                            (2) ->  node 17
                                              (17) ->  node 27

                                          (45) ->  node 46

                                      (48) ->  node 28

                                      (48) ->  node 25

                                    (10) ->  node 9

                                  (18) ->  node 37

                                  (18) ->  node 47

                            (40) ->  node 8

                            (40) ->  node 30

                          (31) ->  node 35

                    (43) ->  node 29

                    (43) ->  node 21

                  (7) ->  node 16

              (15) ->  node 34

            (11) ->  node 33

        (22) ->  node 0

        (22) ->  node 1
      "
    `);
  });
});
