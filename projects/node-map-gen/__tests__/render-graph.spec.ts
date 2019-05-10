import 'jest-extended';
import { renderGraph } from '../src/render-graph';

describe('render graph', () => {
  let display: string;
  beforeAll(() => {
    const graph = {
      roomId: 0,
      children: [
        {
          roomId: 1,
          children: [
            {
              roomId: 4,
              children: [],
            },
            {
              roomId: 3,
              children: [],
            },
          ],
        },
        {
          roomId: 5,
          children: [
            {
              roomId: 6,
              children: [],
            },
          ],
        },
      ],
    };
    display = renderGraph(graph);
  });

  test('looks like this', () => {
    expect(display).toBeString();
    expect(display).toMatchInlineSnapshot(`
      "<root> node 0
        (0) ->  node 1
          (1) ->  node 4

          (1) ->  node 3

        (0) ->  node 5
          (5) ->  node 6
      "
    `);
  });
});
