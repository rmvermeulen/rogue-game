import { createLabel } from './index';

describe('createLabel', () => {
  it('creates a html thing with text', () => {
    const el = createLabel('foo-bar');
    expect(el.textContent).toBe('foo-bar');
  });
});
