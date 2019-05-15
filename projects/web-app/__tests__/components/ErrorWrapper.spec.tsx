import React from 'react';
import renderer from 'react-test-renderer';

import { ErrorWrapper } from '@components/ErrorWrapper';
describe('Error wrapper', () => {
  it('renders', () => {
    const rendered = renderer.create(<ErrorWrapper message="Test error" />);
    expect(rendered).toMatchInlineSnapshot(`
      <div
        className="sc-bdVaJa jxCGKD"
      >
        <h2>
          Something went wrong!
        </h2>
        <pre>
          Test error
        </pre>
      </div>
    `);
  });
});
