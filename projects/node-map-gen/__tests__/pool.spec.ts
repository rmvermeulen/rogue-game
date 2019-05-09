import { Pool } from '../src/pool';
import { createRNG } from '../src/random';

describe('Shuffled pool', () => {
  let pool: Pool<number>;
  beforeEach(() => {
    pool = new Pool([1, 2, 3, 4], createRNG(12345));
  });

  it('contains items', () => {
    expect(pool.size).toBe(4);
  });

  it('can be shuffled', () => {
    expect(pool).toHaveProperty('items', expect.toBeArrayOfSize(4));
    pool.shuffle();
    expect(pool).toHaveProperty('items', expect.toBeArrayOfSize(4));
  });

  it('can take items', () => {
    pool.add(5);
    expect(pool.size).toBe(5);
  });

  test('get an item', () => {
    expect(typeof pool.takeOne()).toBe('number');
    expect(typeof pool.takeOne()).toBe('number');
    expect(typeof pool.takeOne()).toBe('number');
    expect(typeof pool.takeOne()).toBe('number');
    expect(pool.takeOne()).toBeUndefined();
  });

  test('get an item by predicate', () => {
    const isEven = (n: number) => n % 2 === 0;
    expect(typeof pool.takeOne(isEven)).toBe('number');
    expect(typeof pool.takeOne(isEven)).toBe('number');
    expect(pool.takeOne(isEven)).toBeUndefined();
  });

  test('get several items', () => {
    const isEven = (n: number) => n % 2 === 0;
    expect(pool.takeMany(isEven)).toHaveLength(2);
    expect(pool.size).toBe(2);
  });

  test('get N items', () => {
    expect(pool.takeN(3)).toHaveLength(3);
    expect(pool.size).toBe(1);
  });

  test('get N items by predicate', () => {
    const isEven = (n: number) => n % 2 === 0;
    expect(pool.takeN(3, isEven)).toHaveLength(2);
    expect(pool.size).toBe(2);
  });

  test('get N items by predicate that also checks current set', () => {
    expect(pool.takeN(5, (_, set) => set.length < 3)).toHaveLength(3);
    expect(pool.size).toBe(1);
  });
});
