import 'jest-extended';
import React, { Component, ReactNode } from 'react';
import renderer from 'react-test-renderer';

import { ErrorBoundary } from '@containers/ErrorBoundary';

describe('ErrorBoundary', () => {
  it('is an error-boundary', () => {
    expect(ErrorBoundary).toHaveProperty(
      'getDerivedStateFromError',
      expect.toBeFunction(),
    );
    expect(new ErrorBoundary({}, {})).toHaveProperty(
      'componentDidCatch',
      expect.toBeFunction(),
    );
  });

  it('renders children when ok', () => {
    const ok = renderer.create(
      <ErrorBoundary>
        <h1>Status</h1>
        <p>Everything is ok!</p>
      </ErrorBoundary>,
    );
    expect(ok).toMatchInlineSnapshot(`
            Array [
              <h1>
                Status
              </h1>,
              <p>
                Everything is ok!
              </p>,
            ]
        `);
  });

  it('render error-component on error', () => {
    // tslint:disable: max-classes-per-file

    const ThrowOnConstruct = class extends React.Component {
      constructor() {
        super({});
        throw new Error('constructor BAD');
      }
    };

    expect(
      renderer.create(
        <ErrorBoundary>
          <ThrowOnConstruct />
        </ErrorBoundary>,
      ),
    ).toMatchInlineSnapshot(`
            <div
              className="sc-bdVaJa jxCGKD"
            >
              <h2>
                Something went wrong!
              </h2>
              <pre>
                constructor BAD
              </pre>
            </div>
        `);

    const ThrowOnRender = class extends Component {
      public render(): ReactNode {
        throw new Error('render BAD');
      }
    };

    expect(
      renderer.create(
        <ErrorBoundary>
          <ThrowOnRender />
        </ErrorBoundary>,
      ),
    ).toMatchInlineSnapshot(`
      <div
        className="sc-bdVaJa jxCGKD"
      >
        <h2>
          Something went wrong!
        </h2>
        <pre>
          render BAD
        </pre>
      </div>
    `);
  });
});
