import { assert } from 'chai';
import { equals, head, partition, splitAt, splitWhen, tail } from 'ramda';
import { withoutBy } from './generators/utils';

type IsEqual<T> = (a: T, b: T) => boolean;
type Pred<T> = (a: T) => boolean;

type SetPred<T> = (a: T, set: T[]) => boolean;

export class Pool<T> {
  private isEq: IsEqual<T> = equals;
  constructor(private items: T[], private readonly rng: Chance.Chance) {
    assert.isArray(items, '[Pool] Invalid items');
    assert.property(rng, 'shuffle', '[Pool] Invalid rng');
  }

  public useEq(eq: Pool<T>['isEq']) {
    this.isEq = eq;
  }

  public add(item: T): void {
    this.items.push(item);
  }

  public get size() {
    return this.items.length;
  }

  public takeOne(pred?: Pred<T>): T | undefined {
    this.shuffle();
    if (typeof pred === 'function') {
      const [as, [splitItem, ...bs]] = splitWhen(pred, this.items);
      this.items = as.concat(bs);

      return splitItem;
    }

    const item = head(this.items);
    this.items = tail(this.items);

    return item;
  }

  public ref() {
    return this.items;
  }

  public takeMany(pred: Pred<T>) {
    this.shuffle();
    const [result, rest] = partition(pred, this.items);
    this.items = rest;

    return result;
  }

  public takeN(n: number, pred?: SetPred<T>): T[] {
    this.shuffle();
    if (typeof pred === 'function') {
      const accepted = [];
      const rejected = [];
      assert.isArray(this.items, '[Pool] Items invalid');
      for (const item of this.items) {
        if (pred(item, accepted)) {
          accepted.push(item);
        } else {
          rejected.push(item);
        }
      }
      const [results, rest] = splitAt(n, accepted);
      this.items = rest.concat(rejected);

      return results;
    } else {
      const [results, rest] = splitAt(n, this.items);
      this.items = rest;

      return results;
    }
  }

  public remove(toRemove: T[]): void {
    this.items = withoutBy(this.isEq, toRemove, this.items);
  }

  public shuffle() {
    const shuffled = this.rng.shuffle(this.items);
    assert.isArray(shuffled, 'Shuffled array invalid');
    this.items = shuffled;
  }
}
