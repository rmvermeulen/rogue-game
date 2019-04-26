import { gridFactory } from "../src/main";

describe('grid factory', () => {
  it('takes size arguments', () => {
    const width = 5;
    const height = 3;
    const grid = gridFactory({
      width,
      height,
    });
    expect(grid).toMatchObject({
      width,
      height,
    });
    expect(grid.cells).toHaveLength(width * height);
  });
});
